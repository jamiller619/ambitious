import { freeze, onNextFrame } from '../utils/shared'
import { Hooks } from './Hooks'
import { EFFECT_TYPE, dispatchEffectHelper } from './hookUtils'

/**
 * Base type for all Ambitious Component objects
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
  this.hooks = new Hooks()
}

BaseComponent.prototype = {
  async mount (node) {
    const rendered = this.render()

    await onNextFrame(() => {
      node.appendChild(rendered)
      // dispatchEffectHelper(this, EFFECT_TYPE.RESOLVED)
    })

    return this
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
