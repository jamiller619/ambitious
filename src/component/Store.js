import { freeze, areObjectsEqual } from '../utils'

/**
 * the Store object handles state for the Compound Component
 * @param {object} initialState initial state object
 * @param {Function} updateHandler callback function
 * @returns {Store} new instance of a Store object
 */
export function Store (initialState, updateHandler) {
  this.lastState = {}
  this.updateHandler = updateHandler
  this.state = freeze(initialState || {})
}

Store.prototype.setState = async function setState (partialState) {
  const currentState = this.state
  const nextState =
    typeof partialState === 'function'
      ? partialState(currentState)
      : { ...currentState, ...partialState }

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
