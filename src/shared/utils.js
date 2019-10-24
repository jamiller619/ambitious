export const isPromise = obj => obj instanceof Promise

export const { hasOwnProperty, assign } = Object

export const freeze = Object.freeze ? obj => Object.freeze(obj) : obj => obj

export const { isArray } = Array

export const flatten = arr =>
  arr.reduce(
    (acc, val) => isArray(val) ? acc.concat(flatten(val)) : acc.concat(val),
    []
  )

export const generateId = () => {
  return Math.random()
    .toString(36)
    .replace('0.', '')
}

export const merge = (BaseClass, SubClass, SubClassPrototype) => {
  SubClass.prototype = Object.create(BaseClass.prototype)
  Object.assign(SubClass.prototype, SubClassPrototype)
  SubClass.prototype.constructor = SubClass

  return SubClass
}
