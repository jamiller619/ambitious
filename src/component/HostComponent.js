import { isTextElement, areElementsEqual } from '../utils'
import { updateProps } from '../render'
import { inherit } from './BaseComponent'
import createComponent from './createComponent'

const SVG_NS = 'http://www.w3.org/2000/svg'

const updateChildren = (currentComponent, nextComponent) => {
  const currentChildren = currentComponent.renderedChildren
  const nextChildren = nextComponent.getChildren()

  let i = 0
  let l = nextChildren.length

  for (; i < l; i += 1) {
    const nextChild = nextChildren[i]
    const currentChildMatchIndex = currentChildren.findIndex(child =>
      areElementsEqual(child.element, nextChild.element)
    )

    if (currentChildMatchIndex > -1) {
      const currentChildMatch = currentChildren[currentChildMatchIndex]

      if (isTextElement(currentChildMatch.element)) {
        if (isTextElement(nextChild.element)) {
          if (currentChildMatch.element !== nextChild.element) {
            currentChildMatch.getNode().textContent = nextChild.element
          }
        } else {
          currentComponent.replaceChild(nextChild, currentChildMatchIndex)
        }
      } else {
        currentChildMatch.update(nextChild)
      }
    } else {
      const currentChild = currentChildren[i]

      if (currentChild) {
        const nextChildMatch = nextChildren
          .slice(i)
          .find(child => areElementsEqual(child.element, currentChild.element))

        if (nextChildMatch) {
          currentComponent.insertBefore(nextChildMatch, i)
        } else {
          currentChild.update(nextChild)
        }
      } else {
        currentComponent.appendChild(nextChild)
      }
    }
  }

  currentChildren.slice(i).map(child => currentComponent.removeChild(child))
}

export default inherit({
  $$typeof: 'HostComponent',
  construct(element) {
    this.node = null
    this.isSvg = false

    if (!isTextElement(element)) {
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
  update(nextComponent) {
    const prevElement = this.element
    this.element = nextComponent.element

    updateProps(this.node, prevElement, this.element, this.isSvg)
    updateChildren(this, nextComponent)
  },
  render(isSvg) {
    const el = this.element

    if (isTextElement(el)) {
      return (this.node = document.createTextNode(el))
    }

    this.isSvg = isSvg || el.type === 'svg'

    const node = updateProps(
      this.isSvg
        ? document.createElementNS(SVG_NS, el.type)
        : document.createElement(el.type),
      null,
      el,
      this.isSvg
    )

    node.append(...this.renderedChildren.map(child => child.render(this.isSvg)))

    return (this.node = node)
  }
})
