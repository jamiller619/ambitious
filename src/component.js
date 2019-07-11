import {
  T,
  isElementTextNode,
  isComponent,
  getChildren,
  getElement
} from './utils'
import { renderElement, updateProps } from './render'

const areElementsEqual = (a, b) => {
  // const aEl = getElement(a)
  // const bEl = getElement(b)

  // return aEl.key === bEl.key && aEl.type === bEl.type
  return a.key === b.key && a.type === b.type
}

const updateChildren = (node, prevElement, nextElement, isSvg) => {
  const prevChildren = getChildren(prevElement)
  const nextChildren = getChildren(nextElement)

  let i = 0
  let l = nextChildren.length

  for (; i < l; i += 1) {
    const nextChild = nextChildren[i]
    const prevChildMatch = prevChildren.find(child =>
      areElementsEqual(child, nextChild)
    )

    if (prevChildMatch) {
      if (isElementTextNode(prevChildMatch)) {
        if (isElementTextNode(nextChild)) {
          if (prevChildMatch !== nextChild) {
            node.textContent = nextChild
          }
        } else {
          node.replaceChild(renderElement(nextChild, isSvg), node.firstChild)
        }
      } else {
        patch(node.childNodes[i], prevChildMatch, nextChild, isSvg)
      }
    } else {
      const prevChild = prevChildren[i]
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
    node.parentNode.replaceChild(renderElement(nextElement), node)
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

  this.renderedElement = this.renderElement(this.state)
}

Component.prototype.renderElement = function(state) {
  return Object.freeze(this.render(this.props, state, this.setState.bind(this)))
}

Component.prototype.setState = function(partialNextState) {
  const nextState = Object.assign({}, this.state, partialNextState)

  if (nextState !== this.state) {
    Object.assign(this.state, nextState)
    const prevElement = this.renderedElement
    const nextElement = this.renderElement(this.state)

    this.renderedElement = patch(this.node, prevElement, nextElement)
  }
}
