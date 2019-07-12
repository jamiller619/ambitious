import {
  T,
  isElementTextNode,
  isComponent,
  getChildren,
  getElement
} from './utils'
import { renderElement, updateProps } from './render'

const areElementsEqual = (a, b) => {
  return a.key === b.key && a.type === b.type
}

const updateChildren = (node, prevElement, nextElement, isSvg) => {
  const prevChildren = getChildren(prevElement)
  const nextChildren = getChildren(nextElement)

  let i = 0
  let l = nextChildren.length

  for (; i < l; i += 1) {
    const nextChild = nextChildren[i]
    const prevChildMatchIndex = prevChildren.findIndex(child =>
      areElementsEqual(child, nextChild)
    )

    if (prevChildMatchIndex > -1) {
      const prevChildMatch = prevChildren[prevChildMatchIndex]

      if (isElementTextNode(prevChildMatch)) {
        if (isElementTextNode(nextChild)) {
          if (prevChildMatch !== nextChild) {
            node.textContent = nextChild
          }
        } else {
          node.replaceChild(renderElement(nextChild, isSvg), node.firstChild)
        }
      } else {
        patch(
          node.childNodes[prevChildMatchIndex],
          prevChildMatch,
          nextChild,
          isSvg
        )
      }
    } else {
      const prevChild = prevChildren[i]

      if (prevChild) {
        const nextChildMatch = nextChildren
          .slice(i)
          .find(child => areElementsEqual(child, prevChild))

        if (nextChildMatch) {
          node.insertBefore(
            renderElement(nextChildMatch, isSvg),
            node.childNodes[i]
          )
        } else {
          patch(node.childNodes[i], prevChild, nextChild, isSvg)
        }
      } else {
        node.appendChild(renderElement(nextChild, isSvg))
      }
    }
  }

  prevChildren
    .slice(i)
    .map((child, n) => node.removeChild(node.childNodes[i + n]))
}

const patch = (
  node,
  prevElement,
  nextElement,
  isSvg = node.nodeName === 'svg'
) => {
  if (!areElementsEqual(prevElement, nextElement)) {
    node.parentNode.insertBefore(renderElement(nextElement), node)
    node.parentNode.removeChild(node)
  } else {
    updateProps(node, prevElement, nextElement, isSvg)
    updateChildren(node, prevElement, nextElement, isSvg)
  }

  if (isComponent(nextElement)) {
    nextElement.node = prevElement.node
  }

  return nextElement
}

export default function Component(key, type, props) {
  this.$$typeof = T.COMPONENT
  this.key = key
  this.render = type
  this.props = props
  this.state = type.defaultState || {}
  this.queue = []

  this.renderedElement = this.renderElement(this.state)
}

Component.prototype.renderElement = function(state) {
  return Object.freeze(this.render(this.props, state, this.setState.bind(this)))
}

Component.prototype.setState = function(partialNextState) {
  this.queue.push(partialNextState)

  return this.work()
}

Component.prototype.work = function() {
  if (this.node) {
    while (this.queue.length) {
      const partialNextState = this.queue.shift()

      const nextState = Object.assign({}, this.state, partialNextState)

      if (nextState !== this.state) {
        const element = getElement(this)

        Object.assign(this.state, nextState)
        const prevElement = this.renderedElement
        const nextElement = this.renderElement(
          this.state,
          element.type === 'svg'
        )

        this.renderedElement = patch(this.node, prevElement, nextElement)
      }
    }
  }
}
