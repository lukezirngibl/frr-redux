# Typesafe Thunk + View Redux Actions w/ OpenAPI Integration

### Motivation

This library is meant for setting up a fully typed redux frontend application. Data should ideally be perfectly typed all the way from your API boundary to the React component. This library provides a redux pattern and helper methods to accomplish this end to end typing. It also supports a pattern for integrating redux with an OpenAPI spec.


### Getting started using template project

```
git clone git@github.com:lukezirngibl/frr-redux-starter.git frr-redux-starter
cd frr-redux-starter
yarn install or npm install
yarn start or npm start
```

### Manually integrate into existing project

##### Yarn Install

```
yarn add frr-redux
```

##### NPM Install

```
npm install frr-redux
```

### Example

#### This can be found in the /example directory

##### Setup API Types (Manually)

```ts
// import { configureTypeReduxApiCreator } from 'frr-redux/frr/api.helpers'
// import { PostRequest, GetRequest, RestMethod } from 'frr-redux/frr/api.types'
import { configureTypeReduxApiCreator } from '../src/frr/api.helpers'
import { PostRequest, GetRequest, RestMethod } from '../src/frr/api.types'

export enum Endpoints {
  Login = '/login',
  Logout = '/logout',
}

export type API = {
  [Endpoints.Logout]: GetRequest<{
    response: {}
  }>
  [Endpoints.Login]: PostRequest<{
    json: { username: string; password: string }
    response: {
      score: number
    }
  }>
}

export const mapEndpointToMethod: {
  [k in Endpoints]: API[k]['method']
} = {
  [Endpoints.Logout]: RestMethod.GET,
  [Endpoints.Login]: RestMethod.POST,
}

const { createEndpoint } = configureTypeReduxApiCreator<
  API,
  Endpoints,
  typeof mapEndpointToMethod
>(mapEndpointToMethod)

export { createEndpoint }
```

##### Setup API Types (OpenAPI)

```ts
import { Configuration } from './openapi/runtime'
import { AppApi } from './path/to/openApi'

export enum Endpoints {
  Login = '/login',
  Logout = '/logout',
}

const configuration = new Configuration({
  basePath: 'http://localhost:3000/api',
})

const appApi = new AppApi(configuration)

export const mapEndpointToFunc = {
  [Endpoints.Login]: appApi.login.bind(appApi),
  [Endpoints.Logout]: appApi.logout.bind(appApi),
}

const { createEndpoint } = configureApi<Endpoints, typeof mapEndpointToFunc>(
  mapEndpointToFunc,
)

export { createEndpoint }
```

##### Setup API Actions

```ts
import { createEndpoint, Endpoints } from './api'

export const login = createEndpoint<{ username: string }>()(
  {
    request: 'LOGIN_REQUEST',
    success: 'LOGIN_SUCCESS',
    failure: 'LOGIN_FAILURE',
  } as const,
  Endpoints.Login,
)

export const logout = createEndpoint()(
  {
    request: 'LOGOUT_REQUEST',
    success: 'LOGOUT_SUCCESS',
    failure: 'LOGOUT_FAILURE',
  } as const,
  Endpoints.Logout,
)
```

##### Setup View Actions

```ts
// import { createEmptyViewAction, createViewAction } from 'frr-redux/lib/view.helpers'
import { createEmptyViewAction, createViewAction } from '../src/view.helpers'

export enum ViewActionType {
  Reset = 'RESET',
  SetScore = 'SET_SCORE',
}

export type Reset = {
  type: ViewActionType.Reset
}

export const reset = createEmptyViewAction<Reset>(ViewActionType.Reset)

export type SetScore = {
  type: ViewActionType.SetScore
  payload: number
}

export const setScore = createViewAction<SetScore>(ViewActionType.SetScore)
```

##### Setup Reducer

```ts
import * as ApiActions from './api.actions'
import * as ViewActions from './view.actions'

type ReducerAction =
  | ViewActions.SetScore
  | ViewActions.Reset
  | typeof ApiActions.login['action']['success']
  | typeof ApiActions.logout['action']['success']

export type ReducerState = {
  score: number
  reset: boolean
  username: string
}

const initialState: ReducerState = { score: 0, reset: false, username: '' }

export const Reducer = (
  state: ReducerState = initialState,
  action: ReducerAction,
): ReducerState => {
  switch (action.type) {
    case ViewActions.ViewActionType.Reset:
      return { ...state, reset: true }

    case ViewActions.ViewActionType.SetScore:
      return { ...state, score: action.payload }

    case ApiActions.logout.types.success:
      return initialState

    case ApiActions.login.types.success:
      return {
        ...state,
        username: action.meta.username,
        score: action.payload.score,
      }

    default:
      return state
  }
}
```

##### Setup Api Saga (using OpenAPI)

```ts
import { ApiSaga } from 'frr-redux/lib/openapi/api-saga'

export function* Saga() {
  yield fork(ApiSaga)
}
```

##### Setup Api Saga (using manually)

```ts
import { fork } from 'redux-saga/effects'
// import { ApiSaga } from 'frr-redux/lib/frr/api-saga'
import { configureApiSaga } from '../src/frr/api.saga'

const ApiSaga = configureApiSaga({
  baseUrl: 'http://localhost:3000/api',
})

export function* Saga() {
  yield fork(ApiSaga)
}
```

##### Setup Store

```ts
import { applyMiddleware, createStore, combineReducers } from 'redux'
import createSagaMiddleware from 'redux-saga'
import thunkMiddleware from 'redux-thunk'
import { Saga } from './saga'
import { Reducer, ReducerState } from './reducer'

const sagaMiddleware = createSagaMiddleware()

export const RootReducer = combineReducers({
  data: Reducer,
})

export type ReduxState = {
  data: ReducerState
}

export const configureStore = (initialState = {}) => {
  return createStore(
    RootReducer,
    initialState,
    applyMiddleware(thunkMiddleware, sagaMiddleware),
  )
}

export const store = configureStore()

sagaMiddleware.run(Saga)
```

##### Basic React App

```ts
import { Provider, useDispatch, useSelector } from 'react-redux'
import { store, ReduxState } from './store'
import { login, logout } from './api.actions'
import { reset, setScore } from './view.actions'

const Page = () => {
  const dispatch = useDispatch()
  const score = useSelector((state: ReduxState) => state.data.score)
  const username = useSelector((state: ReduxState) => state.data.username)

  return (
    <div>
      <div>Score: {score}</div>
      <div>Username: {username}</div>
      <button
        onClick={() => {
          dispatch(
            login.call({
              json: { username: 'test', password: 'abc123' },
              meta: { username: 'test' },
            }),
          )
        }}
      >
        Login
      </button>
      <button
        onClick={() => {
          dispatch(logout.call())
        }}
      >
        Logout
      </button>
      <button
        onClick={() => {
          dispatch(setScore(score + 1))
        }}
      >
        Increase Score
      </button>

      <button
        onClick={() => {
          dispatch(reset())
        }}
      >
        Reset
      </button>
    </div>
  )
}

export const App = () => {
  return (
    <Provider store={store}>
      <Page />
    </Provider>
  )
}
```
