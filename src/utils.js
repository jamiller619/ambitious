export const COMPONENT_TYPES = {
  COMPOUND: 'COMPOUND',
  HOST: 'HOST',
  FRAGMENT: 'FRAGMENT',
  TEXT: 'TEXT',
  RECYCLED: 'RECYCLED'
}

export const LIFECYCLE_EVENTS = {
  MOUNT: 'mount',
  BEFORE_MOUNT: 'beforemount',
  UNMOUNT: 'unmount',
  BEFORE_UNMOUNT: 'beforeunmount',
  UPDATE: 'update'
}

export const SVG_NS = 'http://www.w3.org/2000/svg'
export const XLINK_NS = 'http://www.w3.org/1999/xlink'

const generateId = () =>
  Math.random()
    .toString(36)
    .replace('0.', '')

export const eventsKey = `$$events__${generateId()}`
export const eventProxy = event => {
  return event.currentTarget[eventsKey][event.type](event)
}

export const isArray = Array.isArray
export const isNullOrFalse = t =>
  t == null || t === false || t === 'false' || t === 0
export const isHTML = t =>
  typeof t === 'object' && (t instanceof Element || t instanceof HTMLDocument)

export const freeze = v => (Object.freeze ? Object.freeze(v) : v)
export const flatten = arr =>
  arr.reduce(
    (acc, val) => (isArray(val) ? acc.concat(flatten(val)) : acc.concat(val)),
    []
  )

export const hasMatchingKeys = (a, b, ai, bi) => {
  const akey = a.key || ai
  const bkey = b.key || bi

  return a && b && akey === bkey
}

export const canUpdateComponent = (
  prevElement,
  nextElement,
  prevElementIndex = 0,
  nextElementIndex = 0
) => {
  return (
    prevElement.type === nextElement.type &&
    hasMatchingKeys(
      prevElement,
      nextElement,
      prevElementIndex,
      nextElementIndex
    )
  )
}

export const areObjectsEqual = (a, b) => {
  if (a == null || b == null) {
    return false
  }

  if (a == b) {
    return true
  }

  const aprops = Object.getOwnPropertyNames(a)
  const bprops = Object.getOwnPropertyNames(b)
  const l = aprops.length

  if (l !== bprops.length) {
    return false
  }

  for (let i = 0; i < l; i++) {
    const name = aprops[i]

    if (a[name] !== b[name]) {
      return false
    }
  }

  return true
}
