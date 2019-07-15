import { freeze, areElementsEqual } from '../utils'
import { inherit } from './BaseComponent'
import createComponent from './createComponent'

export default inherit({
  $$typeof: 'CompoundComponent',
  construct(element) {
    this.state = freeze(element.type.defaultState || {})
    this.instance = createComponent(this.renderInstance())
    this.name = element.type.name
  },
  getChildren() {
    return this.instance.getChildren()
  },
  getNode() {
    return this.instance.getNode()
  },
  renderInstance() {
    // this.instance = (new function (element, state, setState) {
    //   return element.type(element, state, setState)
    // }(this.element, this.state, this.setState))

    return this.element.type(
      this.element.props,
      this.state,
      this.setState.bind(this)
    )
  },
  update(nextElement) {
    const prevElement = this.element
    this.element = nextElement

    if (areElementsEqual(prevElement, this.element)) {
      this.instance.update(this.renderInstance())
    } else {
      const node = this.getNode()
      const nextComponent = createComponent(nextElement)

      this.state = nextComponent.state
      this.instance = nextComponent.instance
      this.name = nextComponent.name

      node.parentNode.replaceChild(this.render(), node)
    }
  },
  setState(partialNextState) {
    const nextState = Object.assign({}, this.state, partialNextState)

    if (nextState !== this.state) {
      this.state = freeze(nextState)
      this.instance.update(this.renderInstance())
    }
  },
  render(namespace) {
    return this.instance.render(namespace)
  }
})
