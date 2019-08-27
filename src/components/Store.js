import { freeze, areObjectsEqual } from '../utils/shared'

/**
 * The Store object is responsible for handling state
 *
 * @param {object} initialState initial state object
 * @param {Function} updateHandler callback function
 * @returns {Store} new instance of a Store object
 */
export function Store (initialState, updateHandler) {
  this.lastState = {}
  this.updateHandler = updateHandler
  this.state = freeze(initialState || {})
}

Store.prototype.setState = async function setState (partialStateOrCallback) {
  const currentState = this.state
  const nextState =
    typeof partialStateOrCallback === 'function'
      ? { ...currentState, ...partialStateOrCallback(currentState) }
      : { ...currentState, ...partialStateOrCallback }

  if (nextState !== currentState) {
    this.state = freeze(nextState)
    await this.updateHandler(currentState, nextState)
  }

  return this.lastState = currentState
}

Store.prototype.onUpdate = function onUpdate (callback) {
  if (!areObjectsEqual(this.lastState, this.state)) {
    callback.call(callback, this.lastState, this.state)
  }
}
