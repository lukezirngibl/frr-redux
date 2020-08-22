# FRR Redux - E2E Typed API actions + Redux 

### Motivation

This library is meant with setting up a fully typed redux frontend application. Data should ideally be perfectly typed all the way from your API boundary to the React component. This library provides a redux pattern and helper methods to accomplish this end to end typing.

### Getting started

##### Yarn Install
```
yarn add frr-redux
yarn add typelevel-ts react fp-ts redux-saga redux-thunk react-redux
```

##### NPM Install
```
npm install frr-redux
npm install typelevel-ts react fp-ts redux-saga redux-thunk react-redux
```

##### Setup API Types (Manually)
```ts

import { configureTypeReduxApiCreator } from 'frr-redux/lib/frr/api.helpers'

import {
  PostRequest,
  GetRequest,
  RestMethod,
} from 'frr-redux/lib/frr/api.types'

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
      score: number;
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
import { AppApi } from './path/to/openApi

export enum Endpoints {
  Login = '/login',
  Logout = '/logout',
}

const configuration = new Configuration({
  basePath: 'http://localhost:3000/api',
})

const appApi = new AppApi(configuration)

export const mapEndpointToFunc = {
  [Endpoints.Login]: appApi.getProducts.bind(appApi),
  [Endpoints.Logout]: appApi.logout.bind(appApi),
}

const { createEndpoint } = configureApi<Endpoints, typeof mapEndpointToFunc>(mapEndpointToFunc)

export { createEndpoint }

```

##### Setup API Actions
```ts

import { createEndpoint } from './path/to/api/types

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

import { createEmptyViewAction } from 'frr-redux/lib/view.helpers'

export enum ViewActionType {
  Reset = 'RESET',
}

export type Reset = {
  type: ViewActionType.Reset
}

export const reset = createEmptyViewAction<Reset>(
  ViewActionType.Reset,
)
```

##### Setup Reducer
```ts

import * as ApiActions from './path/to/api/actions
import * as ViewActions from './path/to/view/actions

type ReducerAction =
   ViewActions.Reset
  | typeof ApiActions.login['action']['success']
  | typeof ApiActions.logout['action']['success']
  
type ReducerState = {
  score: number;
  reset: boolean
  username: string
}

const initialState: ReducerState = { score: 0, reset: false, username: '' };

export const reducer = (
  state: ReducerState = initialState,
  action: ReducerAction,
): State => {
  switch (action.type) {
    case ApiActions.Reset:
       return { ...state, reset: true }
       
    case ApiActions.logout.types.success:
       return initialState;
       
    case ApiActions.login.types.success:
       return { ...state, username: action.meta.username, score: action.payload.score };  
 
    default:
      return state;
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

import { ApiSaga } from 'frr-redux/lib/frr/api-saga'

const ApiSaga = configureApiSaga({
  baseUrl: 'http://localhost:3000/api',
})

export function* Saga() {
  yield fork(ApiSaga)
}

```

##### Setup Store
```ts

import { applyMiddleware, createStore } from 'redux'
import createSagaMiddleware from 'redux-saga'
import thunkMiddleware from 'redux-thunk'
import { Saga } from './path/to/saga'

const sagaMiddleware = createSagaMiddleware()

export const configureStore = (initialState = {}) => {
  return createStore(
    reducer,
    initialState,
    composeWithDevTools(applyMiddleware(thunkMiddleware, sagaMiddleware)),
  )
}

export const store = configureStore()

sagaMiddleware.run(rootSaga)

```

##### Basic React App
```ts

import { Provider, useDispatch, useSelector } from 'react-redux'
import { store } from './path/to/store'
import { login, logout } from './path/to/api/actions'; 
import { reset } from './path/to/view/actions'; 
import { ReduxState } from './path/to/reducer';

const Page = () => {
  const dispatch = useDispatch()
  const score = useSelector((state: ReduxState) => state.score)
  const username = useSelector((state: ReduxState) => state.username)
  
  return (
    <div>
      <div>Score: {score}</div>
      <div>Username: {username}</div>
      <button onClick={() => {
        dispatch(
          login.call({
            body: { username: 'test', password: 'abc123' },
            meta: { username: 'test' }
          })
        )
      }}>
        Login
      </button>
      <button onClick={() => {
        dispatch(
          logout.call({
            body: undefined,
            meta: {}
          })
        )
      }}>
        Login
      </button>
      <button onClick={() => {
        dispatch(reset())
      }}>
        Reset
      </button>
    </div>
  )
}

export const App = () => {
  return (
    <Provider store={store as any}>
      <Page />
    </Provider>
  )
}

```
