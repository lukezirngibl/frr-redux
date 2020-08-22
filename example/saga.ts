import { fork } from 'redux-saga/effects'
// import { ApiSaga } from 'frr-redux/lib/frr/api-saga'
import { configureApiSaga } from '../src/frr/api.saga'

const ApiSaga = configureApiSaga({
  baseUrl: 'http://localhost:3000/api',
})

export function* Saga() {
  yield fork(ApiSaga)
}
