import { freeze } from '../utils'

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
}

export const inherit = ComponentBodyDefinition => {
  const { $$typeof, ...ComponentBody } = ComponentBodyDefinition

  // eslint-disable-next-line require-jsdoc
  function Component (...args) {
    BaseComponent.call(this, $$typeof, ...args)

    if (ComponentBody.construct) {
      ComponentBody.construct.call(this, ...args)
    }
  }

  Component.prototype = Object.create({
    ...BaseComponent.prototype,
    ...ComponentBody
  })

  Component.prototype.constructor = Component

  return Component
}
