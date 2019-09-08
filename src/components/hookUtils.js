import reconciler from '../reconciler'
import { isArray } from '../utils/shared'

export const EFFECT_TYPE = {
  RESOLVED: 'resolved',
  CLEANUP: 'cleanup'
}

// eslint-disable-next-line max-params
export const createEffect = (hook, type, handler, deps) => {
  const prevEffect = hook.effects[type]
  const lastDeps = (prevEffect && prevEffect.deps) || null

  if (deps && !isArray(deps)) {
    throw new Error('Hook dependencies must be an array.')
  }

  return {
    handler,
    deps,
    lastDeps
  }
}

const dispatchEffect = (component, type, ...params) => {
  if (component.hooks) {
    return component.hooks.dispatchEffect(type, ...params)
  }

  return Promise.resolve()
}

export const dispatchEffectHelper = (component, type, ...params) => {
  const dispatch = node =>
    Promise.all(component
        .getChildren()
        .map(child => dispatchEffectHelper(child, type, [node, ...params]))).then(() => dispatchEffect(component, type, [node, ...params]))

  if (type === EFFECT_TYPE.RESOLVED) {
    return reconciler.whenNodeAttached(component, dispatch)
  }

  return dispatch(component.getNode())
}
