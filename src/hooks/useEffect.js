import { getCurrentContext } from '../core/RendererContext'
import { generateId } from '../shared/utils'
import { renderer } from '../renderer'

const globalId = generateId()

const waitForAttachedNode = component => {
  return new Promise(resolve => {
    const interval = window.setInterval(() => {
      if (renderer.isAttached(component)) {
        window.clearInterval(interval)
        resolve()
      }
    }, 2)
  })
}

const getSetDeps = (id, deps, context) => {
  const hasEffects = context.effects
  const hasPrevDeps = hasEffects && context.effects.get(id)

  if (!hasEffects) context.effects = new Map()

  context.effects.set(id, deps)

  return hasPrevDeps ? hasPrevDeps : null
}

const haveDepsChanged = (current, prev) => {
  if (current && prev) {
    if (current.length !== prev.length) return true
    if (current.length === 0 && prev.length === 0) return false
  }

  return prev ? !current.every((el, i) => el === prev[i]) : true
}

const useEffect = (effectCallback, deps, id) => {
  const context = getCurrentContext()
  const prevDeps = getSetDeps(id || globalId, deps, context)

  return waitForAttachedNode(context).then(() => {
    return haveDepsChanged(deps, prevDeps) ? effectCallback() : null
  })
}

export default useEffect
