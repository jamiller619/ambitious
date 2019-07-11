import {
  LIFECYCLE_EVENTS,
  shouldReplaceElement,
  COMPONENT_TYPES,
  getIndexFromKey,
  UID
} from '../utils'
import { update, replaceComponent, insertBefore } from '../render'
import createComponent from './createComponent'

/**
 * Ambitious Components, which are directly modeled after
 * React Components, serve as the basic unit of composition.
 *
 * Every Component type inherits this Base Component,
 * without the need to call the constructor function since
 * that is done automatically in components/types.js
 */
const BaseComponent = {
  construct($$typeof, element, parent) {
    this.$$typeof = $$typeof
    this.element = element
    this.parent = parent
    this.key = element.key

    // if (this.$$typeof !== COMPONENT_TYPES.COMPOUND) {
    //   this.children = element.props
    //     ? element.props.children.map(child => createComponent(child, this))
    //     : []
    // }
  },

  // isType(type) {
  //   return this.$$typeof === type
  // },

  getNode() {
    return this.node
  },

  getChildren() {
    return this.children
  },

  isEqualElement(element) {
    return this.key === element.key
  },

  async update(nextElement) {
    return update(this, nextElement)
  },

  async replaceWith(nextElement) {
    return replaceComponent(nextElement, this)
  },

  async replaceChild(nextElement, currentChildComponent) {
    const currentChildIndex = this.children.findIndex(
      child => child === currentChildComponent
    )
    const newChildComponent = await replaceComponent(
      nextElement,
      currentChildComponent
    )

    this.children.splice(currentChildIndex, 1, newChildComponent)

    return newChildComponent
  },

  async insertBefore(newElement) {
    return insertBefore(newElement, this)
  },

  renderChildren() {
    const children = this.element.props
      ? this.element.props.children.map(child => createComponent(child, this))
      : []

    return (this.children = children)
  }

  // async update(nextElement) {
  //   const currentElement = this.element

  //   if (shouldReplaceElement(currentElement, nextElement)) {
  //     return this.node.
  //     return this.parent.replaceChild(nextElement, currentElement)
  //   }

  //   const node = this.getNode()

  //   updateProps(node, currentElement, nextElement)

  //   return diffChildren(this, currentElement, nextElement)
  // },

  // isEqualElement(element) {
  //   return this.key === element.key
  // },

  // getComponentByElement(element) {
  //   const children = this.getChildren()
  //   const index = children.findIndex(child => child.isEqualElement(element))

  //   if (index < 0) {
  //     console.warn(
  //       'Unable to find component because the element is not a child of this component.'
  //     )
  //   }

  //   return {
  //     index,
  //     component: children[index]
  //   }
  // },

  // async update(nextElement) {
  //   const currentElement = this.element
  //   // this.element = nextElement

  //   if (shouldReplaceComponent(currentElement, nextElement)) {
  //     return this.parent.replaceChild(nextElement, currentElement)
  //   }

  //   const node = this.getNode()

  //   updateProps(node, currentElement, nextElement)

  //   return diffChildren(this, currentElement, nextElement)
  // },

  // /**
  //  * If newComponent is type "Empty", treat like an "add"
  //  * instead. If oldElement is type "Empty", treat it in the
  //  * reverse as a remove
  //  * @param {Element} newElement
  //  * @param {Element} oldElement
  //  */
  // async replaceChild(newElement, oldElement) {
  //   const { component: oldComponent, index } = this.getComponentByElement(
  //     oldElement
  //   )
  //   const newComponent = createComponent(newElement, this)
  //   const oldNode = oldComponent.getNode()
  //   const newNode = newComponent.render()

  //   await Promise.all([
  //     dispatchEvents(LIFECYCLE_EVENTS.BEFORE_UNMOUNT, oldComponent),
  //     dispatchEvents(LIFECYCLE_EVENTS.BEFORE_MOUNT, newComponent)
  //   ])

  //   oldNode.parentNode.replaceChild(newNode, oldNode)
  //   this.children.splice(index, 1, newComponent)

  //   dispatchEvents(LIFECYCLE_EVENTS.UNMOUNT, oldComponent)
  //   dispatchEvents(LIFECYCLE_EVENTS.MOUNT, newComponent)
  // },

  // async removeChild(childElement) {
  //   const { component, index } = this.getComponentByElement(childElement)

  //   const childNode = component.getNode()
  //   await dispatchEvents(LIFECYCLE_EVENTS.BEFORE_UNMOUNT, component)

  //   childNode.parentNode.removeChild(childNode)
  //   this.children.splice(index, 1)

  //   dispatchEvents(LIFECYCLE_EVENTS.UNMOUNT, component)
  // },

  // async updateChild(childElement, nextChildElement) {
  //   const { component } = this.getComponentByElement(childElement)
  //   return component.update(nextChildElement)
  // },

  // async appendChild(newElement) {
  //   const newChildComponent = createComponent(newElement, this)
  //   const newChildNode = newChildComponent.render()
  //   const node = this.getNode()

  //   this.children.push(newChildComponent)

  //   await dispatchEvents(LIFECYCLE_EVENTS.BEFORE_MOUNT, newChildComponent)

  //   node.appendChild(newChildNode)

  //   dispatchEvents(LIFECYCLE_EVENTS.MOUNT, newChildComponent)
  // },

  // async insertBefore(newElement, referenceElement) {
  //   const { component, index } = this.getComponentByElement(referenceElement)

  //   const childNode = component.getNode()
  //   const newChildComponent = createComponent(newElement, this)
  //   const newChildNode = newChildComponent.render()

  //   this.children.splice(index, 0, newChildComponent)

  //   await dispatchEvents(LIFECYCLE_EVENTS.BEFORE_MOUNT, newChildComponent)

  //   childNode.parentNode.insertBefore(newChildNode, childNode)

  //   dispatchEvents(LIFECYCLE_EVENTS.UNMOUNT, newChildComponent)
  // }
}

export default BaseComponent
