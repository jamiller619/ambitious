// simple random id generator
const generateId = () =>
  Math.random()
    .toString(36)
    .replace('0.', '')

export const globalKey = generateId()
export const eventsKey = `$$events__${globalKey}`
export const isPromise = obj => obj instanceof Promise

export const freeze = Object.freeze ? obj => Object.freeze(obj) : obj => obj
export const { isArray } = Array
export const flatten = arr =>
  arr.reduce(
    (acc, val) => isArray(val) ? acc.concat(flatten(val)) : acc.concat(val),
    []
  )
