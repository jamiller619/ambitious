import { freeze } from '../utils/shared'
import createElement from '../createElement'
import createComponent from './createComponent'

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
}

BaseComponent.prototype = {
  mount (parentNode) {
    const parentElement = createElement(parentNode)
    const parentComponent = createComponent(parentElement)

    parentComponent.renderedChildren.push(this)
    parentComponent.render()

    return this
  },

  setParent (parent) {
    if (parent && this.parent !== parent) {
      this.parent = parent
    }
  }
}

export const extend = component => {
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
