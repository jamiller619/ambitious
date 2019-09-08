import { isArray, onNextFrame } from '../utils/shared'
import COMPONENT_TYPE from './type'
import { areElementsEqual } from '../AmbitiousElement'
import reconciler from '../reconciler'
import createComponent from './createComponent'
import { EFFECT_TYPE, dispatchEffectHelper } from './hookUtils'
import { Store } from './Store'
import { Hooks } from './Hooks'

// eslint-disable-next-line max-lines-per-function
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
    return new Promise(resolve => {
      const renderedElement = this.renderElement(element)

      if (renderedElement) {
        if (this.instance) {
          this.instance.update(renderedElement)
        } else {
          this.instance = createComponent(renderedElement)
        }

        dispatchEffectHelper(this, EFFECT_TYPE.RESOLVED).then(resolve)
      }
    })
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
      onUpdate: this.hooks
        .registerEffect(EFFECT_TYPE.STATE_UPDATE)
        .bind(this.hooks),
      setState: this.store.setState.bind(this.store)
    }

    return element.type.call(element.type, props, state)
  },

  replaceChild (newChild) {
    const lastInstance = this.instance

    this.instance = newChild

    return reconciler.replaceChild(this, newChild, lastInstance)
  },

  // eslint-disable-next-line max-statements
  update (nextElement) {
    return new Promise(resolve => {
      const prevElement = this.element

      if (areElementsEqual(prevElement, nextElement)) {
        this.element = nextElement
        this.renderInstance(nextElement).then(resolve)
      } else {
        this.parent
          .replaceChild(createComponent(nextElement), this)
          .then(resolve)
      }
    })
  },

  render (parent) {
    this.setParent(parent)

    if (isArray(this.instance)) {
      throw new Error('Ambitious doesn\'t yet support arrays being returned from Components.')
    }

    return (this.instance && this.instance.render(this)) || null
  }
}
