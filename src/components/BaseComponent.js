import { LIFECYCLE_EVENTS, canUpdateComponent } from '../utils'
import { dispatchEvents, updateProps, patch, diffChildren } from '../render'
import createComponent from './createComponent'

const BaseComponent = {
  construct($$typeof, element, parent) {
    this.$$typeof = $$typeof
    this.element = element
    this.parent = parent
    this.key = this.element.key
    this.children = element.props
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
    const index = this.children.findIndex(
      child => child.element === element || child.element.key === element.key
    )

    if (index < 0) {
      throw new Error(
        `Unable to update this component's child node because this element doesn't exist in this component's list of children. ${element}`
      )
    }

    return {
      index,
      component: this.children[index]
    }
  },

  async update(nextElement) {
    const currentElement = this.element

    if (canUpdateComponent(currentElement, nextElement)) {
      const node = this.getNode()

      updateProps(node, currentElement, nextElement)

      await patch(diffChildren(this, currentElement, nextElement))
    } else {
      this.parent.replaceChild(nextElement, currentElement)
    }
  },

  async replaceChild(newElement, oldElement) {
    const { component, index } = this.findChildComponentByElement(oldElement)
    const oldNode = component.getNode()
    const parentNode = oldNode.parentNode
    const newComponent = createComponent(newElement, this)
    const newNode = newComponent.render()

    await Promise.all([
      dispatchEvents(LIFECYCLE_EVENTS.BEFORE_UNMOUNT, component),
      dispatchEvents(LIFECYCLE_EVENTS.BEFORE_MOUNT, newComponent)
    ])

    parentNode.replaceChild(newNode, oldNode)

    dispatchEvents(LIFECYCLE_EVENTS.UNMOUNT, component)
    dispatchEvents(LIFECYCLE_EVENTS.MOUNT, newComponent)

    this.children.splice(index, 1, newComponent)
  },

  async removeChild(childElement) {
    const { component, index } = this.findChildComponentByElement(childElement)

    const childNode = component.getNode()

    await dispatchEvents(LIFECYCLE_EVENTS.BEFORE_UNMOUNT, component)

    childNode.parentNode.removeChild(childNode)

    this.children.splice(index, 1)

    dispatchEvents(LIFECYCLE_EVENTS.UNMOUNT, component)
  },

  async updateChild(currentElement, nextElement) {
    const { component } = this.findChildComponentByElement(currentElement)

    await component.update(nextElement)
  },

  async appendChild(newElement) {
    const newChildComponent = createComponent(newElement, this)
    const newChildNode = newChildComponent.render()

    this.getNode().appendChild(newChildNode)
    this.children.push(newChildComponent)
  },

  async insertBefore(newElement, referenceElement) {
    const { component, index } = this.findChildComponentByElement(
      referenceElement
    )

    const childNode = component.getNode()
    const newChildComponent = createComponent(newElement, this)
    const newChildNode = newChildComponent.render()

    await dispatchEvents(LIFECYCLE_EVENTS.BEFORE_MOUNT, newChildComponent)

    childNode.parentNode.insertBefore(newChildNode, childNode)
    this.children.splice(index, 0, newChildComponent)

    dispatchEvents(LIFECYCLE_EVENTS.UNMOUNT, newChildComponent)
  }
}

export default BaseComponent
