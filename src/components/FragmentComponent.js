import COMPONENT_TYPE from './types'
import { updateChildren } from './updateChildren'
import { isSameElement } from '../AmbitiousElement'
import HostComponent from './HostComponent'

export default {
  $$typeof: COMPONENT_TYPE.FRAGMENT_COMPONENT,
  extends: HostComponent,

  update (nextElement) {
    const prevElement = this.element

    this.element = nextElement

    if (isSameElement(prevElement, nextElement)) {
      return updateChildren(this, nextElement)
    }

    return this.parent.replaceChild(nextElement, this)
  },

  render (parent) {
    this.setParent(parent)

    const fragment = document.createDocumentFragment()
    const children = this.children.map(child => child.render(this))

    fragment.append(...children)

    return this.node = fragment
  }
}
