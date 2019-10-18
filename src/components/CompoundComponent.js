import COMPONENT_TYPE from './types'
import { isSameElement } from '../AmbitiousElement'
import { createComponent } from '../AmbitiousComponent'
import { dispatchEffectHelper } from './hookUtils'
import { Store } from './Store'
import { EFFECT_TYPE, Hooks } from './Hooks'

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
    return this.instance ? [this.instance] : []
  },

  getNode () {
    return (this.instance && this.instance.getNode()) || null
  },

  getResolvedTargets () {
    return (this.instance && this.instance.getResolvedTargets()) || null
  },

  renderElement (element) {
    const props = {
      ...element.props,
      useEffect: this.hooks.subscribe(EFFECT_TYPE.RESOLVED).bind(this.hooks)
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
    return this.parent.replaceChild(newChild, this)
  },

  update (nextElement) {
    const prevElement = this.element

    if (isSameElement(prevElement, nextElement)) {
      this.element = nextElement

      return this.renderInstance(nextElement)
    }

    return this.replaceChild(createComponent(nextElement))
  },

  render (parent) {
    this.setParent(parent)

    return (this.instance && this.instance.render(this)) || null
  }
}
