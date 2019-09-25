import { createEffect, EFFECT_TYPE } from './hookUtils'

const runEffect = (hook, type, data) => {
  const { handler, deps } = hook.effects[type]

  hook.effects[type].lastDeps = deps

  return new Promise(resolve => {
    resolve(handler.apply(handler, data))
  })
}

/**
 * Hooks, with a similar API to React
 *
 * @param {string} componentName The name of the component,
 * useful for debugging purposes only
 * @returns {Hooks} new Hooks instance
 */
export function Hooks (componentName) {
  this.componentName = componentName
  this.effects = {
    [EFFECT_TYPE.RESOLVED]: null,
    [EFFECT_TYPE.CLEANUP]: null
  }
}

Hooks.prototype = {
  registerEffect (type) {
    return (handler, deps = []) => {
      this.effects[type] = createEffect(this, type, handler, deps)

      return handler
    }
  },

  haveDepsChanged (type) {
    const { lastDeps, deps } = this.effects[type]

    if (!lastDeps || (lastDeps && lastDeps.length !== deps.length)) {
      return true
    }

    if (lastDeps.length === 0 && deps.length === 0) {
      return false
    }

    const l = lastDeps.length

    for (let i = 0; i < l; i += 1) {
      if (lastDeps[i] !== deps[i]) {
        return true
      }
    }

    return false
  },

  // eslint-disable-next-line max-statements
  dispatchEffect (type, data) {
    if (!this.effects[type]) {
      return Promise.resolve(null)
    }

    if (type === EFFECT_TYPE.CLEANUP) {
      return runEffect(this, type, data)
    }

    if (this.haveDepsChanged(type)) {
      const { deps } = this.effects[type]

      runEffect(this, type, data).then(result => {
        if (type === EFFECT_TYPE.RESOLVED && typeof result === 'function') {
          this.registerEffect(EFFECT_TYPE.CLEANUP)(result, deps)
        }
      })
    }

    return Promise.resolve(null)
  }
}
