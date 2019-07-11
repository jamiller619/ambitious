export const COMPONENT_TYPES = {
  COMPOUND: 'COMPOUND_COMPONENT',
  HOST: 'HOST_COMPONENT',
  FRAGMENT: 'FRAGMENT_COMPONENT',
  TEXT: 'TEXT_COMPONENT',
  RECYCLED: 'RECYCLED_COMPONENT',
  EMPTY: 'EMPTY_COMPONENT'
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

const seedCache = {}

export const generateId = seed => {
  if (seed != null && seedCache[seed]) {
    return seedCache[seed]
  }

  const id = Math.random()
    .toString(36)
    .replace('0.', '')

  if (seed != null) {
    seedCache[seed] = id
  }

  return id
}

export const generateKey = index => `$$__ambitious${generateId(index)}`

export const getIndexFromKey = key => {
  if (key == null) {
    return null
  }

  const id = key.replace('$$__ambitious', '')

  for (const index in seedCache) {
    if (seedCache[index] === id) {
      return Number(index)
    }
  }

  return null
}

export const UID = generateId()

export const shouldReplaceElement = (a, b) => {
  return a.type !== b.type || a.key !== b.key
}

export const isEqual = (a, b) => {
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
