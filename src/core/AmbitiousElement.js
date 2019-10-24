import { flatten, freeze } from '../shared/utils'

const AMBITIOUS_ELEMENT = Symbol('ambitious.element')

/* eslint-disable max-params */
/**
 * The element is the building block for an Ambitious app.
 * These form the core representation of our view and used
 * in the reconciliation of views.
 * @param {string|Function|Object} type The element's type
 * @param {string} key The element's unique key
 * @param {Object} props The props object
 * @param {number} index The element's index within its
 * @returns {Object} Returns an object representation
 */
function AmbitiousElement (
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
/* eslint-enable max-params */

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

export const areElementsEqual = (a, b, { ignoreOrder = false } = {}) => {
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

/* eslint-disable eqeqeq */
export const createElement = (type, config, ...children) => {
  if (type != null && type !== false && typeof type === 'object') {
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
  /* eslint-enable eqeqeq */

  return AmbitiousElement(type, key, props)
}
