import { freeze, areElementsEqual, isArray } from '../utils'
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
  renderInstance () {
    return this.element.type(
      this.element.props,
      this.state,
      this.setState.bind(this)
    )
  },
  async update (nextElement) {
    const prevElement = this.element

    this.element = nextElement

    if (areElementsEqual(prevElement, this.element)) {
      await this.instance.update(this.renderInstance())
    } else {
      const node = this.getNode()
      const nextComponent = createComponent(nextElement)

      this.state = nextComponent.state
      this.instance = nextComponent.instance
      this.name = nextComponent.name

      node.parentNode.replaceChild(this.render(), node)
    }
  },
  async setState (partialNextState) {
    const nextState = { ...this.state, ...partialNextState }

    if (nextState !== this.state) {
      this.state = freeze(nextState)
      await this.instance.update(this.renderInstance())
    }
  },
  render (namespace) {
    return isArray(this.instance)
      ? this.instance.map(inst => inst.render(namespace))
      : this.instance.render(namespace)
  }
})
