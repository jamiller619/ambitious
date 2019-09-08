// simple random id generator
const generateId = () =>
  Math.random()
    .toString(36)
    .replace('0.', '')

export const eventsKey = `$$events__${generateId()}`
export const isPromise = obj => obj instanceof Promise

export const onNextFrame = callback =>
  new Promise(resolve => {
    window.requestAnimationFrame(time => {
      if (typeof callback === 'function') {
        const result = callback.call(callback, time)

        return isPromise(result) ? result : resolve()
      }
    })
  })

export const freeze = Object.freeze ? obj => Object.freeze(obj) : obj => obj
export const { isArray } = Array
export const flatten = arr =>
  arr.reduce(
    (acc, val) => isArray(val) ? acc.concat(flatten(val)) : acc.concat(val),
    []
  )

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
