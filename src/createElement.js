import { freeze, flatten, generateKey, COMPONENT_TYPES } from './utils'

const AMBITIOUS_ELEMENT = Symbol('ambitious.element')

const defineProp = v => ({ value: v })

const Element = function(type, props, key) {
  const element = {}

  Object.defineProperties(element, {
    $$typeof: defineProp(AMBITIOUS_ELEMENT),
    type: defineProp(type || COMPONENT_TYPES.EMPTY),
    props: defineProp(props),
    key: defineProp(key)
  })

  return freeze(element)
}

export default function createElement(type, config, ...children) {
  if (
    typeof type === 'object' &&
    type != null &&
    type.$$typeof === AMBITIOUS_ELEMENT
  ) {
    return type
  }

  const { key, ...props } = config || {}

  props.children = flatten(children).map((el, i) => {
    if (typeof el === 'string' || typeof el === 'number' || el.key != null) {
      return el
    }

    return Element(el.type, el.props, generateKey(i))
  })

  return Element(type, props || {}, key)
}
