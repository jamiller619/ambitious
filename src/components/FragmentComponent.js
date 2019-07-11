import { COMPONENT_TYPES, shouldReplaceElement } from '../utils'
import { patchChildren } from '../render'

const FragmentComponent = {
  $$typeof: COMPONENT_TYPES.FRAGMENT,

  getNode() {
    let node = null
    let i = 0
    const children = this.getChildren()
    const l = children.length

    while (node == null && i < l) {
      node = children[i].getNode()
      i++
    }

    return node.parentNode
  },

  async update(nextElement) {
    const currentElement = this.element

    if (shouldReplaceElement(currentElement, nextElement)) {
      return this.parent.replaceChild(nextElement, currentElement)
    }

    return patchChildren(this, nextElement)
  },

  render() {
    const fragment = document.createDocumentFragment()

    fragment.append(...this.renderChildren().map(child => child.render()))

    return fragment
  }
}

export default FragmentComponent
