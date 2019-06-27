import { COMPONENT_TYPES, LIFECYCLE_EVENTS, freeze, isEqual } from '../utils'
import { dispatchEvents } from '../render'
import createComponent from './createComponent'
// import Queue from '../support/Queue'

const CompoundComponent = {
  $$typeof: COMPONENT_TYPES.COMPOUND,

  construct(element) {
    this.displayName = element.type.name
    const state = element.type.defaultState || {}

    this.children = [createComponent(this.renderComponent(state), this)]
  },

  getNode() {
    return this.children[0].getNode()
  },

  getChildren() {
    return this.children[0].getChildren()
  },

  async update(nextElement) {
    const currentElement = this.element

    if (
      currentElement.type !== nextElement.type ||
      currentElement.key !== nextElement.key
    ) {
      await this.parent.insertBefore(nextElement, currentElement)
      return this.parent.removeChild(currentElement)
      // return this.parent.replaceChild(nextElement, currentElement)
    }

    this.element = nextElement
    const nextChildElement = this.renderComponent(this.state)

    return this.children[0].update(nextChildElement)

    // const newComponent = createComponent(nextElement)
    // const newChildElement = this.renderComponent(this.state)

    // return this.children[0].update(newChildElement)
  },

  async setState(partialState) {
    // const queue = new Queue()

    const nextState = Object.assign({}, this.state, partialState)

    if (isEqual(nextState, this.state) === false) {
      const nextElement = this.renderComponent(nextState)
      // const item = await this.children[0].update(nextElement)
      await this.children[0].update(nextElement)

      // queue.enqueue(item)

      // queue.enqueue({
      //   task: 'updateLifecycle',
      //   action: async () => {
      dispatchEvents(LIFECYCLE_EVENTS.UPDATE, this.children[0])
      // }
      // })
    }

    // await queue.flush()
  },

  renderComponent(state) {
    this.state = freeze(state)
    const { element, setState } = this

    return element.type(element.props, this.state, setState.bind(this))
  },

  render() {
    return this.children[0].render()
  }
}

export default CompoundComponent
