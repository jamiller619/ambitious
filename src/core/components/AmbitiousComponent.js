import { flatten, merge } from '../../shared/utils'
import Emitter from '../Emitter'
import { renderer } from '../../renderer'

const flattenChildren = component =>
  flatten(component.getChildren().map(flattenChildren))

/**
 * The Base Component from which all other Components are created.
 * @param {AmbitiousElement} element The component's base element
 * @returns {AmbitiousComponent} A new AmbitiousComponent instance
 */
function AmbitiousComponent (element) {
  Emitter.call(this)

  this.element = element
  this.parent = null
}

export default merge(Emitter, AmbitiousComponent, {
  render (parent) {
    if (parent && this.parent !== parent) {
      this.parent = parent
    }
  },

  appendChildren () {
    const childNodes = this.getChildren().map(child => child.render(this))

    renderer.appendChildren(this.getNode(), ...childNodes)
  },

  dispatchEvents (type) {
    const dispatch = () => {
      const flattened = [...flattenChildren(this), this]

      return Promise.all(flattened.map(component => Promise.resolve(component.emit(type))))
    }

    return dispatch()
  }
})
