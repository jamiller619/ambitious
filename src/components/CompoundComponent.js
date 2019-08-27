import {
  areElementsEqual,
  isArray,
  COMPONENT_TYPE,
  onNextFrame
} from '../utils/shared'
import renderer from '../renderer'
import { extend } from './BaseComponent'
import createComponent from './createComponent'
import { EFFECT_TYPE, dispatchEffectHelper } from './hookUtils'
import { Store } from './Store'
import { Hooks } from './Hooks'

// eslint-disable-next-line require-jsdoc
function stateUpdateHandler (component) {
  return async function handleStateUpdate (oldState, newState) {
    if (component.instance) {
      await component.instance.update(component.renderInstance(component.element))

      component.hooks.dispatchEffect(EFFECT_TYPE.STATE_UPDATE, {
        data: [oldState, newState]
      })
    }
  }
}

export default extend({
  $$typeof: COMPONENT_TYPE.COMPOUND_COMPONENT,

  construct (element) {
    this.name = element.type.name
    this.hooks = new Hooks(this.name)
    this.store = new Store(element.type.defaultState, stateUpdateHandler(this))

    const instance = this.renderInstance(element)

    this.instance = (instance && createComponent(instance)) || null
  },

  getChildren () {
    return (this.instance && this.instance.getChildren()) || []
  },

  getNode () {
    return (this.instance && this.instance.getNode()) || null
  },

  getChildIndex () {
    return 0
  },

  renderInstance (element) {
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

    const instance = element.type.call(element.type, props, state)

    if (instance) {
      onNextFrame(() => dispatchEffectHelper(this, EFFECT_TYPE.RESOLVED))
    }

    return instance
  },

  removeChild (child) {
    return renderer.removeChild(this, child)
  },

  replaceChild (newChild) {
    return renderer.replaceChild(this, newChild, this.instance)
  },

  // eslint-disable-next-line max-statements
  async update (nextElement) {
    const prevElement = this.element

    if (areElementsEqual(prevElement, nextElement)) {
      this.element = nextElement
      const nextInstance = this.renderInstance(nextElement)

      if (nextInstance) {
        if (this.instance) {
          await this.instance.update(nextInstance)
        } else {
          this.instance = nextInstance
        }
      }
    } else {
      const index = this.parent.getChildIndex(this)

      await this.parent.replaceChild(createComponent(nextElement), index)
    }

    return this
  },

  render (parent) {
    this.setParent(parent)

    if (isArray(this.instance)) {
      throw new Error('Ambitious doesn\'t yet support arrays being returned from Components.')
    }

    return (this.instance && this.instance.render(this)) || null
  }
})
