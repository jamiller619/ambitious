import {
  COMPONENT_TYPES,
  LIFECYCLE_EVENTS,
  freeze,
  isEqual,
  shouldReplaceComponent
} from '../utils'
import { dispatchEvents } from '../render'
import createComponent from './createComponent'

const validateState = state => {
  if (typeof state !== 'object') {
    return Error(
      `Component state must be of type "object" but instead received "${typeof state}" with a value of "${state}".`
    )
  }

  return state
}

const CompoundComponent = {
  $$typeof: COMPONENT_TYPES.COMPOUND,

  construct(element) {
    const state = validateState(element.type.defaultState) || {}

    this.displayName = element.type.name
    this.instance = createComponent(this.renderComponent(state), this)
  },

  getNode() {
    return this.instance.getNode()
  },

  getChildren() {
    return this.instance.getChildren()
  },

  async setState(partialState) {
    await new Promise(resolve => {
      window.requestAnimationFrame(async () => {
        const nextState = Object.assign(
          {},
          this.state,
          validateState(partialState)
        )

        if (isEqual(nextState, this.state) === false) {
          const nextElement = this.renderComponent(nextState)
          await this.instance.update(nextElement)
        }

        resolve()
      })
    })

    dispatchEvents(LIFECYCLE_EVENTS.UPDATE, this.instance)
  },

  async update(nextElement) {
    const currentElement = this.element

    if (shouldReplaceComponent(currentElement, nextElement)) {
      return this.parent.replaceChild(nextElement, currentElement)
    }

    this.element = nextElement
    const nextInstanceElement = this.renderComponent(this.state)

    return this.instance.update(nextInstanceElement)
  },

  async replaceChild(nextElement) {
    return this.parent.replaceChild(nextElement, this.element)
  },

  renderComponent(state) {
    this.state = freeze(validateState(state))
    const { element, setState } = this

    return element.type(element.props, this.state, setState.bind(this))
  },

  render() {
    return this.instance.render()
  }
}

export default CompoundComponent
