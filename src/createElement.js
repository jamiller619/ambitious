import { freeze, flatten, generateId } from './utils'

const AMBITIOUS_ELEMENT = Symbol('ambitious.element')

const defineProp = v => ({ value: v })

const Element = function(type, props, key) {
  const element = {}

  Object.defineProperties(element, {
    $$typeof: defineProp(AMBITIOUS_ELEMENT),
    type: defineProp(type),
    props: defineProp(props),
    key: defineProp(key || `$$__ambitious${generateId()}`)
  })

  return freeze(element)
}

export default function createElement(type, config, ...children) {
  if (typeof type === 'object' && type.$$typeof === AMBITIOUS_ELEMENT) {
    return type
  }

  const { key, ...props } = config || {}

  props.children = flatten(children)

  return Element(type, props || {}, key || 0)
}
