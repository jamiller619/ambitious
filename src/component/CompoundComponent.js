import {
  areElementsEqual,
  isArray,
  EFFECT_TYPE,
  COMPONENT_TYPE
} from '../utils'
import { inherit } from './BaseComponent'
import createComponent from './createComponent'
import Queue from '../queue'
import { Store } from './Store'

// eslint-disable-next-line require-jsdoc
function stateUpdateHandler (component) {
  return async function handleStateUpdate (oldState, newState) {
    if (component.instance) {
      await component.instance.update(component.renderInstance(component.element))

      component.dispatchEffect(EFFECT_TYPE.STATE_UPDATE, oldState, newState)
    }
  }
}

export default inherit({
  $$typeof: COMPONENT_TYPE.COMPOUND_COMPONENT,

  construct (element) {
    this.name = element.type.name
    this.store = new Store(element.type.defaultState, stateUpdateHandler(this))
    this.instance = createComponent(this.renderInstance())
  },

  getChildren () {
    return this.instance.getChildren()
  },

  getNode () {
    return this.instance.getNode()
  },

  getChildIndex () {
    return 0
  },

  renderInstance (prevElement) {
    const props = {
      ...this.element.props,
      useEffect: this.addEffect(EFFECT_TYPE.RESOLVED).bind(this)
    }

    const state = {
      ...this.store.state,
      onUpdate: this.addEffect(EFFECT_TYPE.STATE_UPDATE).bind(this),
      setState: this.store.setState.bind(this.store)
    }

    const element = this.element.type.call(this.element.type, props, state)

    if (this.instance) {
      const node = this.getNode()

      if (node.isConnected === true) {
        this.dispatchEffect(EFFECT_TYPE.RESOLVED, prevElement.props)
      }
    }

    return element
  },

  async replaceChild (newChild) {
    const oldChild = this.instance
    const newNode = newChild.render(this)
    const oldNode = oldChild.getNode()

    this.instance = newChild

    const queue = new Queue()

    queue.addTask(() => {
      oldNode.parentNode.replaceChild(newNode, oldNode)
    })

    await oldChild.dispatchEffect(EFFECT_TYPE.CLEANUP)
    await queue.flush()

    newChild.dispatchEffect(EFFECT_TYPE.RESOLVED)
  },

  async update (nextElement) {
    const prevElement = this.element

    if (areElementsEqual(prevElement, nextElement)) {
      this.element = nextElement
      await this.instance.update(this.renderInstance(prevElement))
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

    return this.instance.render(this, namespace)
  }
})
