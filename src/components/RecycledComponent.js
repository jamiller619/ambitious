import { COMPONENT_TYPES } from '../utils'
import createComponent from './createComponent'
import createElement from '../createElement'

const RecycledComponent = {
  $$typeof: COMPONENT_TYPES.RECYCLED,

  construct() {
    this.children = [...this.element.type.childNodes].map(child =>
      createComponent(createElement(child), this)
    )
  },

  getNode() {
    return this.element.type
  },

  render() {
    return this.element.type
  }
}

export default RecycledComponent
