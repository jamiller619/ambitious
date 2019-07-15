/* eslint-disable no-case-declarations */
import { areElementsEqual } from '../utils'
import { updateProps } from '../render'
import { inherit } from './BaseComponent'
import createComponent from './createComponent'

const updateChildren = (currentComponent, nextElement) => {
  const currentComponentChildren = currentComponent.renderedChildren
  const nextElementChildren = nextElement.props.children

  let i = 0
  let l = nextElementChildren.length

  for (; i < l; i += 1) {
    const nextElementChild = nextElementChildren[i]

    if (typeof nextElementChild !== 'object') {
      const currentChild = currentComponentChildren[i]

      if (typeof currentChild.element !== 'object') {
        if (currentChild.element !== nextElementChild) {
          currentChild.getNode().textContent = currentChild.element = nextElementChild
        }
      } else {
        currentComponent.replaceChild(
          createComponent(nextElementChild),
          currentChild
        )
      }
    } else {
      const currentChildMatch = currentComponentChildren.find(child =>
        areElementsEqual(child.element, nextElementChild)
      )

      if (currentChildMatch) {
        currentChildMatch.update(nextElementChild)
      } else {
        const currentComponentChild = currentComponentChildren[i]

        if (currentComponentChild) {
          const nextElementChildMatch = nextElementChildren
            .slice(i)
            .find(child =>
              areElementsEqual(child, currentComponentChild.element)
            )

          if (nextElementChildMatch) {
            currentComponent.insertBefore(
              createComponent(nextElementChildMatch),
              i
            )
          } else {
            currentComponentChild.update(nextElementChild)
          }
        } else {
          currentComponent.appendChild(createComponent(nextElementChild))
        }
      }
    }
  }

  currentComponentChildren
    .slice(i)
    .map(child => currentComponent.removeChild(child))
}

export default inherit({
  $$typeof: 'HostComponent',
  construct(element) {
    this.node = null
    this.namespace = null

    if (typeof element === 'object') {
      this.renderedChildren = element.props.children.map(child =>
        createComponent(child)
      )
    }
  },
  getChildren() {
    return this.renderedChildren
  },
  getNode() {
    return this.node
  },
  replaceChild(newChild, oldChildIndex) {
    const oldChild = this.renderedChildren[oldChildIndex]

    this.renderedChildren[oldChildIndex] = newChild
    this.node.insertBefore(newChild.render(), oldChild.getNode())
  },
  insertBefore(newChild, referenceIndex) {
    const refChild = this.renderedChildren[referenceIndex]

    this.renderedChildren.splice(referenceIndex, 0, newChild)
    this.node.insertBefore(newChild.render(), refChild.getNode())
  },
  appendChild(newChild) {
    this.renderedChildren.push(newChild)
    this.node.appendChild(newChild.render())
  },
  removeChild(oldChild) {
    const oldChildIndex = this.renderedChildren.findIndex(
      child => child === oldChild
    )

    this.renderedChildren.splice(oldChildIndex, 1)
    this.node.removeChild(oldChild.getNode())
  },
  update(nextElement) {
    const prevElement = this.element
    this.element = nextElement

    updateProps(this.node, prevElement, this.element, this.namespace)
    updateChildren(this, nextElement)
  },
  render(namespace) {
    const { element } = this

    if (typeof element !== 'object') {
      return (this.node = document.createTextNode(element))
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

    node.append(
      ...this.renderedChildren.map(child => child.render(this.namespace))
    )

    return (this.node = node)
  }
})
