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

export const areElementsEqual = (a, b) => {
  return a.key === b.key && a.index === b.index && a.type === b.type
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
