import {
  COMPONENT_TYPES,
  LIFECYCLE_EVENTS,
  freeze,
  isEqual,
  shouldReplaceElement
} from '../utils'
import { dispatchEvents, replaceComponent } from '../render'
import createComponent from './createComponent'

const validateState = state => {
  if (typeof state !== 'object') {
    throw new Error(
      `Component state must be of type "object" but instead received "${typeof state}" with a value of "${state}".`
    )
  }

  return state
}

const CompoundComponent = {
  $$typeof: COMPONENT_TYPES.COMPOUND,

  construct(element) {
    this.displayName = element.type.name
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
          const nextElement = this.renderInstance(nextState)
          await this.instance.update(nextElement)
        }

        resolve()
      })
    })

    // dispatchEvents(LIFECYCLE_EVENTS.UPDATE, this.instance)
  },

  async update(nextElement) {
    const currentElement = this.element

    if (shouldReplaceElement(currentElement, nextElement)) {
      // return this.replaceWith(nextElement)
      return this.parent.replaceChild(nextElement, this)
    }

    const nextInstanceElement = this.renderInstance(this.state)

    return this.instance.update(nextInstanceElement)
  },

  async replaceChild(nextElement, currentChildComponent) {
    const newChildComponent = await replaceComponent(
      nextElement,
      currentChildComponent
    )

    this.instance = newChildComponent

    return newChildComponent
  },

  // async replaceChild(nextElement) {
  //   return this.parent.replaceChild(nextElement, this.element)
  // },

  // async appendChild(element) {
  //   return this.parent.appendChild(element)
  // },

  // async removeChild(element) {
  //   return this.parent.removeChild(element)
  // },

  // async updateChild(...args) {
  //   return this.parent.updateChild(...args)
  // },

  // async insertBefore(...args) {
  //   return this.parent.insertBefore(...args)
  // },

  renderInstance(state) {
    this.state = freeze(validateState(state))
    const { element, setState } = this

    return element.type(element.props, this.state, setState.bind(this))
  },

  render() {
    const state = validateState(this.element.type.defaultState || {})
    this.instance = createComponent(this.renderInstance(state), this)

    return this.instance.render()
  }
}

export default CompoundComponent
