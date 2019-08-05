import { freeze, isArray, EFFECT_TYPE } from '../utils'

const haveDepsChanged = (a, b) => {
  if (!isArray(a) || !isArray(b) || a.length !== b.length) {
    return true
  }

  const l = a.length

  for (let i = 0; i < l; i += 1) {
    if (a[i] != b[i]) {
      return true
    }
  }

  return false
}

/**
 * base type for all Component types
 *
 * @param {string} $$typeof either `HostComponent` or `CompoundComponent`
 * @param {Element} element source element object
 * @param {Component} parent this Component's parent instance
 * @return {Component} new Component of specified type
 */
function BaseComponent ($$typeof, element) {
  this.$$typeof = $$typeof
  this.element = freeze(element)
  this.parent = null
  this.effects = {}
}

BaseComponent.prototype = {
  addEffect (type) {
    return (handler, deps) => {
      const effectType = this.effects[type]
      const lastDeps = effectType ? effectType.deps : null

      this.effects[type] = { handler, deps, lastDeps }

      return handler
    }
  },

  async dispatchEffect (type, ...params) {
    const effect = this.effects[type]

    if (effect && haveDepsChanged(effect.lastDeps, effect.deps)) {
      const result = await effect.handler.apply(this.element.type, [
        this.getNode(),
        ...params
      ])

      if (type === EFFECT_TYPE.RESOLVED && typeof result === 'function') {
        this.addEffect(EFFECT_TYPE.CLEANUP)(result, effect.deps)
      }

      return result
    }

    return effect
  }
}

export const inherit = component => {
  const { $$typeof, ...ComponentBody } = component

  // eslint-disable-next-line require-jsdoc
  function Component (...args) {
    BaseComponent.call(this, $$typeof, ...args)

    if (ComponentBody.construct) {
      return ComponentBody.construct.apply(this, args)
    }
  }

  const ComponentProto = {
    ...BaseComponent.prototype,
    ...ComponentBody
  }

  Component.prototype = ComponentProto
  Component.prototype.constructor = Component

  return Component
}
