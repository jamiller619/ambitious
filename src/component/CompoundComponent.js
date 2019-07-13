import { freeze, areElementsEqual } from '../utils'
import { inherit } from './BaseComponent'
import createComponent from './createComponent'

export default inherit({
  $$typeof: 'CompoundComponent',
  construct(element) {
    this.state = freeze(element.type.defaultState || {})
    this.renderedComponent = this.renderComponent(this.state)
    this.name = element.type.name
  },
  getChildren() {
    return this.renderedComponent.getChildren()
  },
  getNode() {
    return this.renderedComponent.getNode()
  },
  renderComponent(state) {
    return createComponent(
      this.element.type(this.element.props, state, this.setState.bind(this))
    )
  },
  update(nextComponent) {
    const prevElement = this.element
    this.element = nextComponent.element

    if (areElementsEqual(prevElement, this.element)) {
      this.renderedComponent.update(nextComponent.renderedComponent)
    } else {
      const node = this.getNode()

      this.state = nextComponent.state
      this.renderedComponent = nextComponent.renderedComponent
      this.name = nextComponent.name

      node.parentNode.replaceChild(this.render(), node)
    }
  },
  setState(partialNextState) {
    const { state } = this
    const nextState = Object.assign({}, state, partialNextState)

    if (nextState !== state) {
      const nextComponent = this.renderComponent(nextState)

      this.state = freeze(nextState)
      this.renderedComponent.update(nextComponent)
    }
  },
  render(isSvg) {
    return this.renderedComponent.render(isSvg)
  }
})
