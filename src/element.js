import { freeze, flatten } from './utils'

const AMBITIOUS_ELEMENT = Symbol('ambitious.element')

const defineProp = v => ({ value: v })

const Element = function(type, props, key) {
  const element = {}
  const displayName =
    typeof type === 'function' ? type.name : type.displayName || null

  Object.defineProperties(element, {
    $$typeof: defineProp(AMBITIOUS_ELEMENT),
    displayName: defineProp(displayName || null),
    type: defineProp(type),
    props: defineProp(props || {}),
    key: defineProp(key || null)
  })

  return freeze(element)
}

export default function createElement(type, config, ...children) {
  const { key, ...props } = config || {}

  props.children = flatten(children).filter(child => child !== false)

  return Element(type, props, key)
}
