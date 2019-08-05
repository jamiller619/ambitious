export const AMBITIOUS_ELEMENT = Symbol('ambitious.element')

export const COMPONENT_TYPE = {
  HOST_COMPONENT: 0,
  COMPOUND_COMPONENT: 1
}

export const EFFECT_TYPE = {
  RESOLVED: 'resolved',
  CLEANUP: 'cleanup',
  STATE_UPDATE: 'stateupdate'
}

// simple random id generator
const generateId = () =>
  Math.random()
    .toString(36)
    .replace('0.', '')

export const eventsKey = `$$events__${generateId()}`

export const freeze = Object.freeze ? obj => Object.freeze(obj) : obj => obj
export const { isArray } = Array
export const flatten = arr =>
  arr.reduce(
    (acc, val) => isArray(val) ? acc.concat(flatten(val)) : acc.concat(val),
    []
  )

export const areElementsEqual = (a, b) => {
  return a.key === b.key && a.type === b.type
}

// eslint-disable-next-line max-statements
export const areObjectsEqual = (a, b) => {
  if (a == null || b == null) {
    return false
  }

  const aprops = Object.getOwnPropertyNames(a)
  const apropsLength = aprops.length
  const bprops = Object.getOwnPropertyNames(b)

  if (apropsLength != bprops.length) {
    return false
  }

  for (let i = 0; i < apropsLength; i += 1) {
    const propName = aprops[i]

    if (a[propName] !== b[propName]) {
      return false
    }
  }

  return true
}
