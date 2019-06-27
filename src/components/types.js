import BaseComponentObj from './BaseComponent'
import CompoundComponentObj from './CompoundComponent'
import HostComponentObj from './HostComponent'
import FragmentComponentObj from './FragmentComponent'
import TextComponentObj from './TextComponent'
import RecycledComponentObj from './RecycledComponent'
import EmptyComponentObj from './EmptyComponent'

const createComponentType = ComponentSubType => {
  function Component(...args) {
    const $$typeof = ComponentSubType.$$typeof

    BaseComponentObj.construct.call(this, $$typeof, ...args)

    if (ComponentSubType.construct) {
      ComponentSubType.construct.call(this, ...args)
    }
  }

  Component.prototype = Object.create(
    Object.assign({}, BaseComponentObj, ComponentSubType)
  )

  Component.prototype.constructor = Component

  return Component
}

export const CompoundComponent = createComponentType(CompoundComponentObj)
export const HostComponent = createComponentType(HostComponentObj)
export const TextComponent = createComponentType(TextComponentObj)
export const FragmentComponent = createComponentType(FragmentComponentObj)
export const RecycledComponent = createComponentType(RecycledComponentObj)
export const EmptyComponent = createComponentType(EmptyComponentObj)
