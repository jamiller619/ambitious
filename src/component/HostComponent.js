/* eslint-disable no-loop-func */
/* eslint-disable max-statements */
import { COMPONENT_TYPE, EFFECT_TYPE } from '../utils'
import { updateProps } from '../render'
import { inherit } from './BaseComponent'
import createComponent from './createComponent'
import Queue from '../queue'
import { updateChildren } from './updateChildren'

export default inherit({
  $$typeof: COMPONENT_TYPE.HOST_COMPONENT,

  construct (element) {
    this.node = null
    this.namespace = null
    this.renderedChildren =
      element.props &&
      element.props.children.map(child => createComponent(child))
  },

  getChildren () {
    return this.renderedChildren
  },

  getNode () {
    return this.node
  },

  getChildIndex (child) {
    return this.renderedChildren.findIndex(c => c === child)
  },

  async replaceChild (newChild, oldChildIndex) {
    const oldChild = this.renderedChildren[oldChildIndex]
    const oldNode = oldChild.getNode()
    const newNode = newChild.render(this)

    await oldChild.dispatchEffect(EFFECT_TYPE.CLEANUP)

    this.renderedChildren[oldChildIndex] = newChild
    this.node.replaceChild(newNode, oldNode)

    newChild.dispatchEffect(EFFECT_TYPE.RESOLVED)
  },

  insertBefore (newChild, referenceIndex) {
    const refChild = this.renderedChildren[referenceIndex]
    const newNode = newChild.render(this)

    this.renderedChildren.splice(referenceIndex, 0, newChild)
    this.node.insertBefore(newNode, refChild.getNode())

    newChild.dispatchEffect(EFFECT_TYPE.RESOLVED)
  },

  appendChild (newChild) {
    const newNode = newChild.render()

    this.renderedChildren.push(newChild)
    this.node.appendChild(newNode)

    newChild.dispatchEffect(EFFECT_TYPE.RESOLVED)
  },

  async removeChild (oldChild) {
    const oldNode = oldChild.getNode()
    const oldChildIndex = this.renderedChildren.findIndex(child => child === oldChild)

    await oldChild.dispatchEffect(EFFECT_TYPE.CLEANUP)

    this.renderedChildren.splice(oldChildIndex, 1)
    this.node.removeChild(oldNode)
  },

  async update (nextElement) {
    const prevElement = this.element

    this.element = nextElement

    const queue = new Queue()

    queue.addTask(() =>
      updateProps(this.node, prevElement, this.element, this.namespace))

    queue.addTask(...updateChildren(this, nextElement).tasks)

    await queue.flush()
  },

  render (parent, namespace) {
    this.parent = parent

    const { element } = this

    if (typeof element !== 'object') {
      return this.node = document.createTextNode(element)
    }

    this.namespace = namespace || element.props.xmlns
    if (element.type === 'svg') {
      this.namespace = 'http://www.w3.org/2000/svg'
    }

    const node = updateProps(
      this.namespace
        ? document.createElementNS(this.namespace, element.type)
        : document.createElement(element.type),
      null,
      element,
      this.namespace
    )

    node.append(...this.renderedChildren.map(child => child.render(this, this.namespace)))

    return this.node = node
  }
})
