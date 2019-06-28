import { LIFECYCLE_EVENTS, shouldReplaceComponent } from '../utils'
import { dispatchEvents, updateProps, diffChildren } from '../render'
import createComponent from './createComponent'

/**
 * Ambitious Components, which are directly modeled after
 * React Components, are the basic unit of composition.
 *
 * Every Component inherits this Base Component, without the
 * need to call the constructor function since that is done
 * automatically in components/types.js
 */
const BaseComponent = {
  construct($$typeof, element, parent) {
    this.$$typeof = $$typeof
    this.element = element
    this.parent = parent

    this.key = element ? element.key : null
    this.children =
      element && element.props
        ? element.props.children.map(child => createComponent(child, this))
        : null
  },

  getNode() {
    return this.node
  },

  getChildren() {
    return this.children
  },

  findChildComponentByElement(element) {
    const children = this.getChildren()

    const index = children.findIndex(child => {
      if (typeof element === 'string' || typeof element === 'number') {
        return child.text === element
      }
      return child.element.key === element.key
    })

    if (index < 0) {
      throw new Error(
        `Unable to update this component's child node because this element doesn't exist in this component's list of children. ${element}`
      )
    }

    return {
      index,
      component: children[index]
    }
  },

  async update(nextElement) {
    const currentElement = this.element
    this.element = nextElement

    if (shouldReplaceComponent(currentElement, nextElement)) {
      return this.parent.replaceChild(nextElement, currentElement)
    }

    const node = this.getNode()

    updateProps(node, currentElement, nextElement)

    return diffChildren(this, currentElement, nextElement)
  },

  async replaceChild(newElement, oldElement) {
    const { component, index } = this.findChildComponentByElement(oldElement)
    const oldNode = component.getNode()
    const parentNode = oldNode.parentNode
    const newComponent = createComponent(newElement, this)
    const newNode = newComponent.render()

    this.children.splice(index, 1, newComponent)

    await Promise.all([
      dispatchEvents(LIFECYCLE_EVENTS.BEFORE_UNMOUNT, component),
      dispatchEvents(LIFECYCLE_EVENTS.BEFORE_MOUNT, newComponent)
    ])

    parentNode.replaceChild(newNode, oldNode)

    dispatchEvents(LIFECYCLE_EVENTS.UNMOUNT, component)
    dispatchEvents(LIFECYCLE_EVENTS.MOUNT, newComponent)
  },

  async removeChild(childElement) {
    const { component, index } = this.findChildComponentByElement(childElement)

    const childNode = component.getNode()

    this.children.splice(index, 1)

    await dispatchEvents(LIFECYCLE_EVENTS.BEFORE_UNMOUNT, component)

    childNode.parentNode.removeChild(childNode)

    dispatchEvents(LIFECYCLE_EVENTS.UNMOUNT, component)
  },

  async updateChild(currentElement, nextElement) {
    const { component } = this.findChildComponentByElement(currentElement)
    return component.update(nextElement)
  },

  async appendChild(newElement) {
    const newChildComponent = createComponent(newElement, this)
    const newChildNode = newChildComponent.render()
    const node = this.getNode()

    this.children.push(newChildComponent)

    await dispatchEvents(LIFECYCLE_EVENTS.BEFORE_MOUNT, newChildComponent)

    node.appendChild(newChildNode)

    dispatchEvents(LIFECYCLE_EVENTS.MOUNT, newChildComponent)
  },

  async insertBefore(newElement, referenceElement) {
    const { component, index } = this.findChildComponentByElement(
      referenceElement
    )

    const childNode = component.getNode()
    const newChildComponent = createComponent(newElement, this)
    const newChildNode = newChildComponent.render()

    this.children.splice(index, 0, newChildComponent)

    await dispatchEvents(LIFECYCLE_EVENTS.BEFORE_MOUNT, newChildComponent)

    childNode.parentNode.insertBefore(newChildNode, childNode)

    dispatchEvents(LIFECYCLE_EVENTS.UNMOUNT, newChildComponent)
  }
}

export default BaseComponent
