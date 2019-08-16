/* eslint-disable eqeqeq */
import {
  createEffect,
  createEffectsContainer,
  runEffect,
  areDepsEqual,
  EFFECT_TYPE
} from './hookUtils'

/**
 * Hooks, with a similar API to React
 *
 * @returns {Hooks} new Hooks instance
 */
export function Hooks () {
  this.effects = createEffectsContainer()
}

Hooks.prototype = {
  setName (name) {
    this.componentName = name
  },

  registerEffect (type) {
    return (handler, deps = null) => {
      this.effects[type] = createEffect(this, type, handler, deps)

      return handler
    }
  },

  shouldRunEffect (type, comparisonOperator = null) {
    const effect = this.effects[type]
    const { lastDeps, deps } = effect

    if (comparisonOperator) {
      return comparisonOperator(lastDeps, deps)
    }

    return areDepsEqual(lastDeps, deps) === false
  },

  async dispatchEffect (type, { data } = {}, comparisonOperator = null) {
    if (this.effects[type]) {
      if (type === EFFECT_TYPE.CLEANUP) {
        return runEffect(this, type, data)
      } else if (this.shouldRunEffect(type, comparisonOperator)) {
        const { deps } = this.effects[type]
        const result = await runEffect(this, type, data)

        if (type === EFFECT_TYPE.RESOLVED && typeof result === 'function') {
          this.registerEffect(EFFECT_TYPE.CLEANUP)(result, deps)
        }

        return result
      }
    }

    return null
  }
}
