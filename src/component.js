import {
  T,
  ieTextElement,
  isComponent,
  getChildren,
  getElement,
  freeze
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

      if (ieTextElement(prevChildMatch)) {
        if (ieTextElement(nextChild)) {
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
  this.render = freeze(type)
  this.props = freeze(props)
  this.node = null
  this.state = freeze(type.defaultState || {})

  this.renderedElement = this.renderElement(this.state)
}

Component.prototype.setNode = function(node) {
  this.node = node

  if (isComponent(this.renderedElement)) {
    this.renderedElement.setNode(node)
  }

  return this
}

Component.prototype.renderElement = function(state) {
  return this.render(this.props, state, this.setState.bind(this))
}

Component.prototype.setState = function(partialNextState) {
  const nextState = Object.assign({}, this.state, partialNextState)

  if (nextState !== this.state) {
    this.state = freeze(nextState)

    const element = getElement(this)
    const prevElement = this.renderedElement
    const nextElement = this.renderElement(this.state, element.type === 'svg')

    this.renderedElement = patch(this.node, prevElement, nextElement)
  }
}
