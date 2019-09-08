import reconciler from '../reconciler'
import { isArray } from 'util'

export const EFFECT_TYPE = {
  RESOLVED: 'resolved',
  CLEANUP: 'cleanup',
  STATE_UPDATE: 'stateupdate'
}

export const createEffectsContainer = () => {
  return {
    [EFFECT_TYPE.RESOLVED]: null,
    [EFFECT_TYPE.CLEANUP]: null,
    [EFFECT_TYPE.STATE_UPDATE]: null
  }
}

export const runEffect = (hook, type, data) => {
  const { handler, deps } = hook.effects[type]

  hook.effects[type].lastDeps = deps

  return handler.apply(handler, data)
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
  return new Promise(resolve => {
    if (component.hooks) {
      const result = component.hooks.dispatchEffect(type, ...params)

      resolve(result)
    } else {
      resolve()
    }
  })
}

const dispatchChildEffects = (component, type, ...params) => {
  return Promise.all(component.getChildren().map(child => dispatchEffect(child, type, ...params)))
}

const dispatchAllEffects = (component, type, ...params) => {
  return new Promise(resolve => {
    const dispatch = node => {
      dispatchChildEffects(component, type, [node, ...params]).then(() => {
        dispatchEffect(component, type, [node, ...params]).then(resolve)
      })
    }

    if (type === EFFECT_TYPE.RESOLVED) {
      reconciler.whenNodeAttached(component, dispatch)
    } else {
      dispatch(component.getNode())
    }
  })
}

export const dispatchEffectHelper = (component, type, ...params) => {
  return new Promise(resolve => {
    dispatchAllEffects(component, type, ...params).then(resolve)
  })
}
