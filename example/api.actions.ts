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
