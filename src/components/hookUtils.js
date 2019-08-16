import { isArray } from '../utils/shared'

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

export const areDepsEqual = (a, b) => {
  if (!isArray(a) || !isArray(b) || a.length !== b.length) {
    return false
  }

  const l = a.length

  for (let i = 0; i < l; i += 1) {
    if (a[i] !== b[i]) {
      return false
    }
  }

  return true
}

export const runEffect = (hook, type, data) => {
  const { handler, deps } = hook.effects[type]

  hook.effects[type].lastDeps = deps

  return handler.apply(handler, data)
}

export const createEffect = (hook, type, handler, deps) => {
  const prevEffect = hook.effects[type]
  const lastDeps = (prevEffect && prevEffect.deps) || null

  return {
    handler,
    deps,
    lastDeps
  }
}

const dispatchEffect = (component, type, ...params) => {
  return component.hooks.dispatchEffect(type, {
    data: [component.getNode(), ...params]
  })
}

const dispatchAllEffects = async (component, type, ...params) => {
  const children = component.getChildren()

  await Promise.all(children.map(child => dispatchAllEffects(child, type, ...params)))

  return dispatchEffect(component, type, ...params)
}

// const getAllEffects = (component, type) => {
//   const effect = component.hooks.effects[type]
//   const effects = effect ? [effect] : []
//   const children = component.getChildren()

//   children.forEach(child => {
//     if (child.hooks.effects[type]) {
//       effects.push(...getAllEffects(child, type))
//     }
//   })

//   return effects
// }

export const dispatchEffectHelper = async (component, type, ...params) => {
  return dispatchAllEffects(component, type, ...params)
}
