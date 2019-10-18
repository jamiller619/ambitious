import { isArray } from '../utils/shared'

export const EFFECT_TYPE = {
  RESOLVED: 'resolved',
  CLEANUP: 'cleanup'
}

const dispatchEffect = (hook, type, data) => {
  const { handler, deps } = hook.effects[type]

  hook.effects[type].lastDeps = deps

  return Promise.resolve(handler.apply(handler, data))
}

const createHook = (handler, deps) => {
  if (deps && !isArray(deps)) {
    throw Error('Hook dependencies must be an array.')
  }

  return {
    handler,
    deps
  }
}

/**
 * Compares dependencies of the last effect ran for this
 * hook to determine if any changes have been made
 *
 * @param {array} deps1 Dependency array one
 * @param {array} deps2 Dependency array two
 * @return {boolean} true or false
 */
const areDependenciesEqual = (deps1, deps2) => {
  if (
    deps1 == null ||
    deps2 == null ||
    (deps1 != null && deps2 != null && deps1.length !== deps2.length)
  ) {
    return false
  }

  const l = deps1.length

  for (let i = 0; i < l; i += 1) {
    if (deps1[i] !== deps2[i]) {
      return false
    }
  }

  return true
}

/**
 * In short, Hooks provide access to a Component's
 * lifecycle. Hooks embrace the functional nature of
 * Ambitious, while providing better options for reuse as
 * wealls organization.
 *
 * @return {Hooks} instance of Hooks
 */
export function Hooks () {
  // There are currently only two Hook types managed by the
  // Hooks class. Need to revisit later and add use/set/State
  this.effects = {
    [EFFECT_TYPE.RESOLVED]: null,
    [EFFECT_TYPE.CLEANUP]: null
  }
}

Hooks.prototype.subscribe = function subscribe (type) {
  return (handler, deps = []) => {
    const lastDeps = (this.effects[type] && this.effects[type].deps) || null

    this.effects[type] = {
      ...createHook(handler, deps),
      lastDeps
    }

    return handler
  }
}

Hooks.prototype.dispatch = function dispatch (type, data) {
  if (!this.effects[type]) {
    return Promise.resolve(null)
  }

  if (type === EFFECT_TYPE.CLEANUP) {
    return dispatchEffect(this, type, data)
  }

  const { lastDeps, deps } = this.effects[type]

  if (areDependenciesEqual(lastDeps, deps) === false) {
    dispatchEffect(this, type, data).then(result => {
      if (type === EFFECT_TYPE.RESOLVED && typeof result === 'function') {
        this.subscribe(EFFECT_TYPE.CLEANUP)(result, deps)
      }
    })
  }

  return Promise.resolve(null)
}
