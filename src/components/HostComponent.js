import COMPONENT_TYPE from './types'
import reconciler from '../reconciler'
import { createComponent } from '../AmbitiousComponent'
import queue from '../utils/Queue'
import { updateChildren } from './updateChildren'
import { isSameElement } from '../AmbitiousElement'

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
    return this.children
  },

  getNode () {
    return this.node
  },

  getResolvedTargets () {
    return this.node
  },

  replaceChild (newChild, oldChild) {
    const oldChildIndex = this.children.findIndex(child => child === oldChild)

    this.children[oldChildIndex] = newChild

    return reconciler.replaceChild(this, newChild, oldChild)
  },

  insertBefore (newChild, referenceIndex) {
    const refChild = this.children[referenceIndex]

    if (this.children.length === referenceIndex) {
      return reconciler.appendChild(this, newChild)
    }

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

    if (isSameElement(prevElement, nextElement)) {
      return queue
        .task(() => {
          reconciler.updateProps(
            this.node,
            prevElement,
            nextElement,
            this.namespace
          )
        })
        .then(() => updateChildren(this, nextElement))
        .then(() => {
          return Promise.resolve(this.element = nextElement)
        })
    }

    return this.parent
      ? this.parent.replaceChild(createComponent(nextElement), this)
      : Promise.resolve(null)
  },

  render (parent) {
    const { element } = this

    this.setParent(parent)

    if (typeof element !== 'object') {
      return this.node = reconciler.createTextNode(element)
    }

    this.node = reconciler.renderNode(this)

    this.appendChildren()

    return this.node
  }
}
