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
        Login
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
    <Provider store={store as any}>
      <Page />
    </Provider>
  )
}
