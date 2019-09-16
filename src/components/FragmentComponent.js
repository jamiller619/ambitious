import COMPONENT_TYPE from './types'
import Queue from '../utils/Queue'
import { updateChildren } from './updateChildren'
import { areElementsEqual } from '../AmbitiousElement'
import HostComponent from './HostComponent'

export default {
  $$typeof: COMPONENT_TYPE.FRAGMENT_COMPONENT,
  extends: HostComponent,

  update (nextElement) {
    const prevElement = this.element

    this.element = nextElement

    if (areElementsEqual(prevElement, nextElement)) {
      const queue = new Queue()
      const childUpdates = updateChildren(this, nextElement)

      queue.addTask(...childUpdates.tasks)

      return queue.flush()
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
