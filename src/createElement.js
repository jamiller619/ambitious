/* eslint-disable new-cap */
import { AMBITIOUS_ELEMENT, flatten, freeze } from './utils/shared'

const generateKey = i => {
  return `$$_ambitious_${i}`
}

const AmbitiousElement = (type, key, props) =>
  freeze({
    $$typeof: AMBITIOUS_ELEMENT,
    key,
    type,
    props
  })

const createChildElement = (element, index) => {
  if (typeof element !== 'object') {
    return element
  }

  return AmbitiousElement(
    element.type,
    element.key || generateKey(index),
    element.props
  )
}

/**
 * Entry point for JSX compilation
 *
 * @param {string|number|function} type Element type
 * @param {object} config the `props` object
 * @param  {...array} children an array of Elements or a
 * string
 * @returns {Element} a new Element
 */
export default function createElement (type, config, ...children) {
  if (typeof type === 'object') {
    if (type.$$typeof === AMBITIOUS_ELEMENT) return type

    return AmbitiousElement(type)
  }

  const { key, ...props } = config || {}

  props.children = []

  if (children.length > 0) {
    props.children = flatten(children)
      .filter(child => child != null && child !== false)
      .map((child, i) => createChildElement(child, i))
  }

  return AmbitiousElement(type, key, props)
}
