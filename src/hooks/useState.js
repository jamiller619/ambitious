import { getCurrentContext } from '../core/RendererContext'
import { freeze, assign, generateId } from '../shared/utils'
import { EVENT_TYPE } from '../core/components/types'

const globalId = generateId()

const createStateInstance = (initialState, context) => {
  let currentState = freeze(initialState)

  let prevState = null

  return {
    getState () {
      return currentState
    },
    setState (partialState) {
      const nextState = assign({}, currentState, partialState)

      if (nextState !== currentState) {
        prevState = currentState
        currentState = freeze(nextState)

        return Promise.resolve(context.emit(EVENT_TYPE.STATE_UPDATE, prevState))
      }

      return Promise.resolve(null)
    }
  }
}

const getSetCurrentState = (id, initialState) => {
  const context = getCurrentContext()
  const createState = () => createStateInstance(initialState, context)

  if (!context.state) {
    context.state = new Map()
    context.state.set(id, createState())
  }

  return context.state.get(id)
}

const useState = (initialState, id) => {
  const state = getSetCurrentState(id || globalId, initialState)

  return [state.getState(), state.setState.bind(state)]
}

export default useState
