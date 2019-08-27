import renderer from '../renderer'
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

const dispatchEffect = async (component, type, ...params) => {
  if (component.hooks) {
    const node = component.getNode()

    await renderer.whenRendered(node, () => {
      return component.hooks.dispatchEffect(type, [node, ...params])
    })
  } else {
    return null
  }
}

const dispatchAllEffects = async (component, type, ...params) => {
  const children = component.getChildren()

  await Promise.all(children.map(child => dispatchAllEffects(child, type, ...params)))

  return dispatchEffect(component, type, ...params)
}

export const dispatchEffectHelper = (component, type, ...params) => {
  return dispatchAllEffects(component, type, ...params)
}
