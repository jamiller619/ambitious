import AmbitiousComponent from './AmbitiousComponent'
import renderElement from '../renderElement'
import { COMPONENT_TYPE, EVENT_TYPE } from './types'
import { merge } from '../../shared/utils'
import { areElementsEqual } from '../AmbitiousElement'
import { setCurrentContext } from '../RendererContext'

/**
 * Any AmbitiousElement with a function for its type
 * property, will form a Compound Component
 * @param {AmbitiousElement} element The element to base
 * this component from
 * @returns {CompoundComponent} Component instance
 */
function CompoundComponent (element) {
  AmbitiousComponent.call(this, element)

  // Useful in debugging, that's about it
  this.name = (element.type && element.type.name) || null

  // this.render()

  this.on(EVENT_TYPE.STATE_UPDATE, this.render.bind(this))
}

export default merge(AmbitiousComponent, CompoundComponent, {
  $$typeof: COMPONENT_TYPE.COMPOUND_COMPONENT,

  getChildren () {
    return this.instance ? [this.instance] : []
  },

  getNode () {
    return (this.instance && this.instance.getNode()) || null
  },

  removeChild () {
    return this.parent.removeChild(this)
  },

  replaceChild (newChild) {
    return this.parent.replaceChild(newChild, this)
  },

  update (nextElement) {
    const prevElement = this.element

    if (areElementsEqual(prevElement, nextElement)) {
      this.element = nextElement

      return Promise.resolve(this.render())
    }

    return this.replaceChild(renderElement(nextElement))
  },

  // eslint-disable-next-line max-statements
  render (parent) {
    AmbitiousComponent.prototype.render.call(this, parent)

    const { element } = this

    const elementInstance = setCurrentContext(this, () => {
      return element.type.call(element.type, element.props)
    })

    const shouldUpdate = elementInstance && this.instance != null
    const shouldRemove = !elementInstance && this.instance != null

    if (shouldUpdate) {
      this.instance.update(elementInstance).then(() => {
        this.dispatchEvents(EVENT_TYPE.RENDER_COMPLETE)
      })
    } else if (shouldRemove) {
      return this.parent.removeChild(this)
    } else if (elementInstance) {
      this.instance = renderElement(elementInstance)
    }

    return (this.instance && this.instance.render(this)) || null
  }
})
