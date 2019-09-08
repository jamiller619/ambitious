import COMPONENT_TYPE from './type'
import reconciler from '../reconciler'
import createComponent from './createComponent'
import Queue from '../utils/Queue'
import { updateChildren } from './updateChildren'

// eslint-disable-next-line max-lines-per-function
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

  async replaceChild (newChild, oldChild) {
    const oldChildIndex = this.children.findIndex(child => child === oldChild)

    await reconciler.replaceChild(this, newChild, oldChild)

    this.children[oldChildIndex] = newChild
  },

  async insertBefore (newChild, referenceIndex) {
    const refChild = this.children[referenceIndex]

    await reconciler.insertBefore(this, newChild, refChild)

    this.children.splice(referenceIndex, 0, newChild)
  },

  appendChild (newChild) {
    this.children.push(newChild)

    return reconciler.appendChild(this, newChild)
  },

  async removeChild (oldChild) {
    const oldChildIndex = this.children.findIndex(child => child === oldChild)

    await reconciler.removeChild(this, oldChild)

    this.children.splice(oldChildIndex, 1)
  },

  // eslint-disable-next-line max-statements
  async update (nextElement) {
    const prevElement = this.element
    const queue = new Queue()
    const node = this.getNode()

    this.element = nextElement

    if (node && node.nodeType !== Node.TEXT_NODE) {
      queue.addTask(() => {
        return reconciler.updateProps(
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
      queue.addTask(() => {
        return reconciler.replaceChild(
          this.parent,
          createComponent(nextElement),
          this
        )
      })
    }

    await queue.flush()

    return this
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
