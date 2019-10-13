import COMPONENT_TYPE from './types'
import { updateChildren } from './updateChildren'
import reconciler from '../reconciler'
import { isSameElement } from '../AmbitiousElement'
import HostComponent from './HostComponent'
import { createComponent } from '../AmbitiousComponent'

export default {
  $$typeof: COMPONENT_TYPE.FRAGMENT_COMPONENT,
  extends: HostComponent,

  update (nextElement) {
    const prevElement = this.element

    this.element = nextElement

    if (isSameElement(prevElement, nextElement)) {
      return updateChildren(this, nextElement)
    }

    const myIndex = this.parent.getChildren().findIndex(child => child === this)
    const newComponent = createComponent(nextElement)

    return Promise.all(this.getChildren().map(child => reconciler.removeChild(child))).then(() => {
      this.parent.children.splice(myIndex, 1)

      return this.parent.insertBefore(newComponent, myIndex)
    })
  },

  render (parent) {
    this.setParent(parent)

    this.node = document.createDocumentFragment()
    this.appendChildren()

    return this.node
  }
}
