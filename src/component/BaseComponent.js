import { freeze } from '../utils'

function BaseComponent($$typeof, element) {
  this.$$typeof = $$typeof
  this.element = freeze(element)
}

BaseComponent.prototype.toJSON = function() {
  const json = {}

  for (const prop in this) {
    json[prop] = JSON.stringify(this[prop])
  }

  return json
}

export const inherit = ComponentBodyDefinition => {
  const { $$typeof, ...ComponentBody } = ComponentBodyDefinition

  function Component(...args) {
    BaseComponent.call(this, $$typeof, ...args)

    if (ComponentBody.construct) {
      ComponentBody.construct.call(this, ...args)
    }
  }

  Component.prototype = Object.create(
    Object.assign({}, BaseComponent.prototype, ComponentBody)
  )

  Component.prototype.constructor = Component

  return Component
}
