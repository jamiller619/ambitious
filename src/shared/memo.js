import { isPromise } from './utils'

const cacheStore = new WeakMap()

const memo = (fn, { cache = new Map(), cacheKey, cacheDepth = 3 } = {}) => {
  return function memoized (...args) {
    const key = cacheKey(...args)

    if (cache.has(key)) return cache.get(key).data

    // eslint-disable-next-line no-invalid-this
    const cacheItem = fn.apply(this, ...args)

    cache.set(key, {
      data: cacheItem,
      depth: cacheDepth
    })

    if (isPromise(cacheItem)) {
      cacheItem.catch(() => cache.delete(key))
    }

    cacheStore.set(memoized, cache)

    return cacheItem
  }
}

export default memo
