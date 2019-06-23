export const COMPONENT_TYPES = {
  COMPOUND: Symbol('ambitious.compoundComponent'),
  HOST: Symbol('ambitious.hostComponent'),
  FRAGMENT: Symbol('ambitious.fragmentComponent'),
  TEXT: Symbol('ambitious.textComponent')
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
