import reconciler from '../reconciler'
import { isArray, flatten } from '../utils/shared'

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
  return component.hooks
    ? component.hooks.dispatchEffect(type, ...params)
    : Promise.resolve()
}

const flattenChildren = component => {
  return flatten(component.getChildren().map(child => flattenChildren(child) && child))
}

export const dispatchEffectHelper = (component, type, ...params) => {
  const dispatch = node => {
    const flattened = [...flattenChildren(component), component]

    return Promise.all(flattened.map(flattenedComponent => {
        return dispatchEffect(flattenedComponent, type, [node, ...params])
      }))
  }

  if (type === EFFECT_TYPE.RESOLVED) {
    return reconciler.waitForAttachedNode(component).then(dispatch)
  }

  return dispatch(component.getNode())
}
