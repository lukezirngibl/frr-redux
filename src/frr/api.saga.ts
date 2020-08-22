import { put, takeEvery, delay as sagaDelay, race } from 'redux-saga/effects'
import { RestApiPayload, SystemActionType } from './api.types'

export type SagaApiConfig = {
  baseUrl: string
  getToken?: () => Promise<string | undefined>
  debug?: boolean
}

const makeApiRequest = (config: SagaApiConfig) => async ({
  method,
  endpoint,
  body,
  server,
}: {
  method: string
  endpoint: string
  server?: string
  body?: string | FormData
}) => {
  let token: string | undefined = undefined
  if (config.getToken) {
    token = await config.getToken()
  }
  const options: RequestInit = {
    method,
    headers: {
      ...(token === undefined
        ? {}
        : {
            'x-access-token': token,
          }),
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body,
  }

  const e = endpoint.endsWith('/')
    ? endpoint.slice(0, endpoint.length - 1)
    : endpoint

  if (config.debug) {
    console.log(`${server || config.baseUrl}/api${e}`, options)
  }

  return fetch(`${server || config.baseUrl}/api${e}`, options)
}

const configuireRestApi = (config: SagaApiConfig) =>
  function* callRestApi(action: {
    payload: RestApiPayload
    type: SystemActionType.REST_CALL
  }) {
    const {
      types,
      meta,
      endpoint,
      body,
      method,
      delay,
      server,
    } = action.payload

    yield put({
      type: types.request,
      payload: undefined,
      meta,
    })

    if (delay !== undefined) {
      yield sagaDelay(delay)
    }

    try {
      const { raw, timeout } = yield race({
        raw: makeApiRequest(config)({ method, endpoint, body, server }),
        timeout: sagaDelay(10000),
      })

      if (!raw) {
        return
      }

      const payload = yield raw.json()

      if (raw.status >= 400) {
        yield put({
          type: types.failure,
          payload,
          meta,
        })
      } else {
        yield put({
          type: types.success,
          payload,
          meta,
        })
      }
    } catch (error) {
      if (config.debug) {
        console.log('error - 4')
      }
      yield put({
        type: types.failure,
        payload: {},
        meta,
      })
    }
  }

export const configureApiSaga = (config: SagaApiConfig) =>
  function* ApiSaga() {
    const callRestApi = configuireRestApi(config)
    yield takeEvery(SystemActionType.REST_CALL, callRestApi)
  }
