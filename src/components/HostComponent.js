import COMPONENT_TYPE from './types'
import reconciler from '../reconciler'
import { createComponent } from '../AmbitiousComponent'
import Queue from '../utils/Queue'
import { updateChildren } from './updateChildren'
import { areElementsEqual } from '../AmbitiousElement'

export default {
  $$typeof: COMPONENT_TYPE.HOST_COMPONENT,

  construct (element) {
    this.node = null
    this.namespace = null
    this.children = element.props
      ? element.props.children.map(createComponent)
      : []

    return this
  },

  getChildren () {
    return this.children || []
  },

  getNode () {
    return this.node
  },

  replaceChild (newChild, oldChild) {
    const oldChildIndex = this.children.findIndex(child => child === oldChild)

    this.children[oldChildIndex] = newChild

    return reconciler.replaceChild(this, newChild, oldChild)
  },

  insertBefore (newChild, referenceIndex) {
    const refChild = this.children[referenceIndex]

    this.children.splice(referenceIndex, 0, newChild)

    return reconciler.insertBefore(this, newChild, refChild)
  },

  appendChild (newChild) {
    this.children.push(newChild)

    return reconciler.appendChild(this, newChild)
  },

  removeChild (oldChild) {
    const oldChildIndex = this.children.findIndex(child => child === oldChild)

    this.children.splice(oldChildIndex, 1)

    return reconciler.removeChild(oldChild)
  },

  // eslint-disable-next-line max-statements
  update (nextElement) {
    const prevElement = this.element
    const queue = new Queue()

    this.element = nextElement

    if (areElementsEqual(prevElement, nextElement)) {
      queue.addTask(() => {
        reconciler.updateProps(
          this.node,
          prevElement,
          this.element,
          this.namespace
        )
      })

      const childUpdates = updateChildren(this, nextElement)

      if (childUpdates.tasks.length > 0) {
        queue.addTask(...childUpdates.tasks)
      }
    } else {
      queue.addTask(() =>
        reconciler.replaceChild(this.parent, createComponent(nextElement), this))
    }

    return queue.flush()
  },

  render (parent) {
    const { element } = this

    this.setParent(parent)

    if (typeof element !== 'object') {
      return this.node = reconciler.createTextNode(element)
    }

    this.node = reconciler.renderNode(this)

    this.children.forEach(child => reconciler.appendChild(this, child))

    return this.node
  }
}
