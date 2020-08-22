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
