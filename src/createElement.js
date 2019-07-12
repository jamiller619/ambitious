import { T, flatten, isElementTextNode } from './utils'
import Component from './component'

const generateKey = i => {
  return `$$_ambitious_${i}`
}

const createChildElement = (element, index) => {
  if (isElementTextNode(element)) {
    return element
  }

  if (element.$$typeof === T.COMPONENT) {
    if (!element.key) {
      element.key = generateKey(index)
    }

    return element
  }

  return createElement(
    element.key || generateKey(index),
    element.type,
    element.props
  )
}

const createElement = (key, type, props) => {
  if (typeof type === 'function') {
    return new Component(key, type, props)
  } else {
    return Object.freeze({
      $$typeof: T.ELEMENT,
      key: key,
      type: type,
      props: props
    })
  }
}

export const h = (type, config, ...children) => {
  if (
    (typeof type === 'object' && type.$$typeof === T.COMPONENT) ||
    type.$$typeof === T.ELEMENT
  ) {
    return type
  }

  const { key, ...props } = config || {}

  props.children = []

  if (children.length > 0) {
    props.children = flatten(children)
      .filter(child => child != null && child !== false)
      .map((child, i) => createChildElement(child, i))
  }

  return createElement(key, type, props)
}
