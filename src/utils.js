export const T = {
  ELEMENT: Symbol('ambitious.element'),
  COMPONENT: Symbol('ambitious.component'),
  FRAGMENT: Symbol('ambitious.fragment')
}

export const EVENTS = {
  ATTACH: 'attach',
  BEFORE_ATTACH: 'beforeattach',
  DETACH: 'detach',
  BEFORE_DETACH: 'beforedetach',
  CATCH: 'catch',
  RENDER: 'render'
}

// simple random id generator
const generateId = () =>
  Math.random()
    .toString(36)
    .replace('0.', '')

export const eventsKey = `$$events__${generateId()}`

export const freeze = Object.freeze ? obj => Object.freeze(obj) : obj => obj
export const isArray = Array.isArray
export const flatten = arr =>
  arr.reduce(
    (acc, val) => (isArray(val) ? acc.concat(flatten(val)) : acc.concat(val)),
    []
  )
export const isTextElement = element =>
  typeof element === 'string' || typeof element === 'number'

export const areElementsEqual = (a, b) => {
  return a.key === b.key && a.type === b.type
}
