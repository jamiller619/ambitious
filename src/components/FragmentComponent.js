import { COMPONENT_TYPES } from '../utils'
import { patch, diffChildren } from '../render'

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

    if (currentElement.key !== nextElement.key) {
      this.parent.replaceChild(nextElement, currentElement)
    } else {
      await patch(diffChildren(this, currentElement, nextElement))
    }
  },

  render() {
    const fragment = document.createDocumentFragment()

    this.children.forEach(child => {
      fragment.appendChild(child.render())
    })

    return fragment
  }
}

export default FragmentComponent
