import {
  areElementsEqual,
  isArray,
  COMPONENT_TYPE,
  onNextFrame
} from '../utils/shared'
import { inherit } from './BaseComponent'
import createComponent from './createComponent'
import { EFFECT_TYPE, dispatchEffectHelper } from './hookUtils'
import { Store } from './Store'

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

export default inherit({
  $$typeof: COMPONENT_TYPE.COMPOUND_COMPONENT,

  construct (element) {
    this.name = element.type.name
    this.store = new Store(element.type.defaultState, stateUpdateHandler(this))

    const instance = this.renderInstance(element)

    this.instance = (instance && createComponent(instance)) || null

    this.hooks.setName(this.name)
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

  async removeChild (child) {
    const node = child.getNode()

    await dispatchEffectHelper(child, EFFECT_TYPE.CLEANUP)

    onNextFrame(() => this.getNode().parentNode.removeChild(node))
  },

  async replaceChild (newChild) {
    const oldChild = this.instance
    const newNode = newChild.render(this)
    const oldNode = oldChild.getNode()

    this.instance = newChild

    await dispatchEffectHelper(oldChild, EFFECT_TYPE.CLEANUP)
    await onNextFrame(() => oldNode.parentNode.replaceChild(newNode, oldNode))

    dispatchEffectHelper(newChild, EFFECT_TYPE.RESOLVED)
  },

  async update (nextElement) {
    const prevElement = this.element

    if (areElementsEqual(prevElement, nextElement)) {
      this.element = nextElement
      await this.instance.update(this.renderInstance(nextElement))
    } else {
      const index = this.parent.getChildIndex(this)

      await this.parent.replaceChild(createComponent(nextElement), index)
    }
  },

  render (parent, namespace) {
    this.parent = parent

    if (isArray(this.instance)) {
      throw new Error('Ambitious doesn\'t yet support arrays being returned from Components.')
    }

    return (this.instance && this.instance.render(this, namespace)) || null
  }
})
