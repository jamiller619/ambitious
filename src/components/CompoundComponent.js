import COMPONENT_TYPE from './types'
import { areElementsEqual } from '../AmbitiousElement'
import reconciler from '../reconciler'
import { createComponent } from '../AmbitiousComponent'
import { EFFECT_TYPE, dispatchEffectHelper } from './hookUtils'
import { Store } from './Store'
import { Hooks } from './Hooks'

export default {
  $$typeof: COMPONENT_TYPE.COMPOUND_COMPONENT,

  construct (element) {
    this.name = element.type.name
    this.hooks = new Hooks(this.name)
    this.store = new Store(element.type.defaultState, (lastState, state) =>
      this.renderInstance(this.element))

    this.renderInstance(element)
  },

  renderInstance (element) {
    const renderedElement = this.renderElement(element)

    const dispatchEffect = () =>
      dispatchEffectHelper(this, EFFECT_TYPE.RESOLVED)

    if (renderedElement) {
      if (this.instance) {
        return this.instance.update(renderedElement).then(dispatchEffect)
      }

      this.instance = createComponent(renderedElement)
    }

    return dispatchEffect()
  },

  getChildren () {
    return (this.instance && this.instance.getChildren()) || []
  },

  getNode () {
    return (this.instance && this.instance.getNode()) || null
  },

  renderElement (element) {
    const props = {
      ...element.props,
      useEffect: this.hooks
        .registerEffect(EFFECT_TYPE.RESOLVED)
        .bind(this.hooks)
    }

    const state = {
      ...this.store.state,
      setState: this.store.setState.bind(this.store)
    }

    return element.type.call(element.type, props, state)
  },

  removeChild () {
    return this.parent.removeChild(this)
  },

  replaceChild (newChild) {
    const lastInstance = this.instance

    this.instance = newChild

    return reconciler.replaceChild(this, newChild, lastInstance)
  },

  update (nextElement) {
    const prevElement = this.element

    if (areElementsEqual(prevElement, nextElement)) {
      this.element = nextElement

      return this.renderInstance(nextElement)
    }

    return this.parent.replaceChild(createComponent(nextElement), this)
  },

  render (parent) {
    this.setParent(parent)

    return (this.instance && this.instance.render(this)) || null
  }
}
