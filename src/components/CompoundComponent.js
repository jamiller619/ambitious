import {
  COMPONENT_TYPES,
  LIFECYCLE_EVENTS,
  freeze,
  areObjectsEqual
} from '../utils'
import { dispatchEvents } from '../render'
import createComponent from './createComponent'

const CompoundComponent = {
  $$typeof: COMPONENT_TYPES.COMPOUND,

  construct(element) {
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

    if (currentElement.type !== nextElement.type) {
      return this.parent.replaceChild(nextElement, currentElement)
    }

    this.element = nextElement

    const newChildElement = this.renderComponent(this.state)

    return this.children[0].update(newChildElement)
  },

  async setState(partialState) {
    const nextState = Object.assign({}, this.state, partialState)

    if (areObjectsEqual(nextState, this.state) === false) {
      const nextElement = this.renderComponent(nextState)

      this.children[0].update(nextElement)

      dispatchEvents(LIFECYCLE_EVENTS.UPDATE, this.children[0])
    }
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
