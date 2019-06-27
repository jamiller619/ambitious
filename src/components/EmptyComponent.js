import { COMPONENT_TYPES } from '../utils'

const EmptyComponent = {
  $$typeof: COMPONENT_TYPES.EMPTY,

  getNode() {
    return document.createDocumentFragment()
  },

  render() {
    return document.createDocumentFragment()
  }
}

export default EmptyComponent
