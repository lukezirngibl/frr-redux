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
