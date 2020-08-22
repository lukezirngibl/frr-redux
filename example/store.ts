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
