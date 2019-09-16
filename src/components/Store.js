import { freeze } from '../utils/shared'

/**
 * The Store object is responsible for handling state
 *
 * @param {object} initialState initial state object
 * @param {Function} updateHandler callback function
 * @returns {Store} new instance of a Store object
 */
export function Store (initialState, updateHandler) {
  this.lastState = {}
  this.handleUpdate = updateHandler
  this.state = freeze(initialState || {})
}

Store.prototype.setState = function setState (partialStateOrCallback) {
  const currentState = this.state
  const nextState = Object.assign(
    {},
    currentState,
    partialStateOrCallback === 'function'
      ? partialStateOrCallback(currentState)
      : partialStateOrCallback
  )

  if (nextState !== currentState) {
    this.state = freeze(nextState)
    this.lastState = currentState

    return this.handleUpdate(currentState, nextState)
  }

  return Promise.resolve()
}
