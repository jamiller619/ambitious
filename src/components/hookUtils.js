import { EFFECT_TYPE } from './Hooks'
import reconciler from '../reconciler'
import { flatten } from '../utils/shared'

const dispatchEffect = (component, type, ...params) => {
  return component.hooks
    ? component.hooks.dispatch(type, ...params)
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
