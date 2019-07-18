import { freeze, areElementsEqual, isArray, EVENTS } from '../utils'
import { dispatchEvents } from '../render'
import { inherit } from './BaseComponent'
import createComponent from './createComponent'

export default inherit({
  $$typeof: 'CompoundComponent',
  construct (element) {
    this.state = freeze(element.type.defaultState || {})
    this.instance = createComponent(this.renderInstance())
    this.name = element.type.name
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
  renderInstance () {
    return this.element.type(
      this.element.props,
      this.state,
      this.setState.bind(this)
    )
  },
  async replaceChild (newChild) {
    const oldChild = this.instance
    const newNode = newChild.render(this)
    const oldNode = oldChild.getNode()

    await Promise.all([
      dispatchEvents(EVENTS.BEFORE_ATTACH, newChild),
      dispatchEvents(EVENTS.BEFORE_DETACH, oldChild)
    ])

    this.instance = newChild
    oldNode.parentNode.replaceChild(newNode, oldNode)

    dispatchEvents(EVENTS.ATTACH, newChild)
    dispatchEvents(EVENTS.DETACH, oldChild)
  },
  async update (nextElement) {
    const prevElement = this.element

    if (areElementsEqual(prevElement, nextElement)) {
      this.element = nextElement
      await this.instance.update(this.renderInstance())
    } else {
      const index = this.parent.getChildIndex(this)

      await this.parent.replaceChild(createComponent(nextElement), index)
    }
  },
  async setState (partialNextState) {
    const nextState = { ...this.state, ...partialNextState }

    if (nextState !== this.state) {
      this.state = freeze(nextState)
      await this.instance.update(this.renderInstance())
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
