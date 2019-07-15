import { T, flatten, freeze } from './utils'

const generateKey = i => {
  return `$$_ambitious_${i}`
}

const Element = (key, type, props) =>
  freeze({
    $$typeof: T.ELEMENT,
    key: key,
    type: type,
    props: props
  })

const createChildElement = (element, index) => {
  if (typeof element !== 'object') {
    return element.toString()
  }

  if (element.$$typeof === T.COMPONENT) {
    if (!element.key) {
      element.key = generateKey(index)
    }

    return element
  }

  return Element(element.key || generateKey(index), element.type, element.props)
}

export default function createElement(type, config, ...children) {
  if (typeof type === 'object' && type.$$typeof === T.ELEMENT) {
    return type
  }

  const { key, ...props } = config || {}

  props.children = []

  if (children.length > 0) {
    props.children = flatten(children)
      .filter(child => child != null && child !== false)
      .map((child, i) => createChildElement(child, i))
  }

  return Element(key, type, props)
}
