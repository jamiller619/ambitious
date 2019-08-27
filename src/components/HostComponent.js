import { COMPONENT_TYPE } from '../utils/shared'
import { EFFECT_TYPE, dispatchEffectHelper } from './hookUtils'

import renderer from '../renderer'
import { extend } from './BaseComponent'
import createComponent from './createComponent'
import Queue from '../utils/Queue'
import { updateChildren } from './updateChildren'

export default extend({
  $$typeof: COMPONENT_TYPE.HOST_COMPONENT,

  construct (element) {
    this.node = null
    this.namespace = null
    this.renderedChildren = element.props
      ? element.props.children.map(createComponent)
      : []
  },

  getChildren () {
    return this.renderedChildren || []
  },

  getNode () {
    return this.node
  },

  getChildIndex (child) {
    return this.renderedChildren.findIndex(c => c === child)
  },

  async replaceChild (newChild, oldChildIndex) {
    const oldChild = this.renderedChildren[oldChildIndex]

    await renderer.replaceChild(this, newChild, oldChild)

    this.renderedChildren[oldChildIndex] = newChild
  },

  async insertBefore (newChild, referenceIndex) {
    const refChild = this.renderedChildren[referenceIndex]

    await renderer.insertBefore(this, newChild, refChild)

    this.renderedChildren.splice(referenceIndex, 0, newChild)
  },

  appendChild (newChild) {
    this.renderedChildren.push(newChild)

    return renderer.appendChild(this, newChild)
  },

  async removeChild (oldChild) {
    const oldChildIndex = this.renderedChildren.findIndex(child => child === oldChild)

    await renderer.removeChild(this, oldChild)

    this.renderedChildren.splice(oldChildIndex, 1)
  },

  // eslint-disable-next-line max-statements
  async update (nextElement) {
    const prevElement = this.element
    const queue = new Queue()

    this.element = nextElement

    if (this.node.nodeType !== Node.TEXT_NODE) {
      queue.addTask(() => {
        return renderer.updateProps(
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
        return renderer.replaceChild(
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
    this.setParent(parent)
    const { element } = this

    if (typeof element !== 'object') {
      return this.node = renderer.createTextNode(element)
    }

    this.node = renderer.renderNode(this)

    this.renderedChildren.forEach(child => renderer.appendChild(this, child))

    return this.node
  }
})
