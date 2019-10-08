import { flatten, freeze } from './utils/shared'

const AMBITIOUS_ELEMENT = Symbol('ambitious.element')

// eslint-disable-next-line func-style, max-params
const AmbitiousElement = function AmbitiousElement (
  type,
  key = null,
  props = { children: [] },
  index = 0
) {
  return freeze({
    $$typeof: AMBITIOUS_ELEMENT,
    key,
    index,
    type,
    props
  })
}

const assignIndex = (element, index) => {
  if (typeof element !== 'object') {
    return element
  }

  return AmbitiousElement(
    element.type,
    element.key,
    element.props,
    index || element.index
  )
}

export const isSameElement = (a, b, { ignoreOrder = false } = {}) => {
  if (typeof a !== 'object' || typeof b !== 'object') {
    return a === b
  }

  if (a.type !== b.type) {
    return false
  }

  if (a.key || b.key) return a.key === b.key

  if (ignoreOrder === false) return a.index === b.index

  return true
}

export const createElement = (type, config, ...children) => {
  if (typeof type === 'object') {
    if (type.$$typeof === AMBITIOUS_ELEMENT) return type

    return AmbitiousElement(type)
  }

  const { key, ...props } = config || {}

  props.children = []

  if (children.length > 0) {
    props.children = flatten(children)
      .filter(child => child != null && child !== false)
      .map(assignIndex)
  }

  return AmbitiousElement(type, key, props)
}
