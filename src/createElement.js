import { freeze, flatten } from './utils'

const AMBITIOUS_ELEMENT = Symbol('ambitious.element')

const defineProp = v => ({ value: v })

const setKey = (element, keyValue) => {
  if (
    typeof element === 'object' &&
    (element.key !== keyValue || element.key == null)
  ) {
    Object.defineProperty(element, 'key', {
      configurable: false,
      value: keyValue
    })
  }

  return freeze(element)
}

const Element = function(type, props, key) {
  const element = {}

  Object.defineProperties(element, {
    $$typeof: defineProp(AMBITIOUS_ELEMENT),
    type: defineProp(type),
    props: defineProp(props),
    key: {
      configurable: true,
      value: key
    }
  })

  return element
}

export default function createElement(type, config, ...children) {
  const { key, ...props } = config || {}

  props.children = flatten(children)
    .filter(child => child !== false)
    .map((child, i) => setKey(child, i))

  return Element(type, props || {}, key || 0)
}
