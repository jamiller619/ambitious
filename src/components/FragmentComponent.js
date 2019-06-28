import { COMPONENT_TYPES, shouldReplaceComponent } from '../utils'
import { diffChildren } from '../render'

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

    if (shouldReplaceComponent(currentElement, nextElement)) {
      return this.parent.replaceChild(nextElement, currentElement)
    }

    this.element = nextElement

    return diffChildren(this, currentElement, nextElement)
  },

  render() {
    const fragment = document.createDocumentFragment()

    fragment.append(...this.children.map(child => child.render()))

    return fragment
  }
}

export default FragmentComponent
