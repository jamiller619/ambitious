import { freeze } from './utils/shared'
import HostComponentBody from './components/HostComponent'
import CompoundComponentBody from './components/CompoundComponent'
import FragmentComponentBody from './components/FragmentComponent'
import COMPONENT_TYPE from './components/types'

const extend = Base => {
  const Component = {
    ...Base.extends,
    ...Base
  }

  // eslint-disable-next-line require-jsdoc
  function AmbitiousComponent (element) {
    this.element = freeze(element)
    this.parent = null

    if (this.construct) {
      this.construct(element)
    }
  }

  AmbitiousComponent.prototype = {
    ...Component,
    constructor: AmbitiousComponent,
    setParent (parent) {
      if (parent && this.parent !== parent) {
        this.parent = parent
        this.namespace = parent.namespace
      }
    }
  }

  return AmbitiousComponent
}

const HostComponent = extend(HostComponentBody)
const CompoundComponent = extend(CompoundComponentBody)
const FragmentComponent = extend(FragmentComponentBody)

export const createComponent = element => {
  return new (typeof element.type === 'function'
    ? CompoundComponent
    : element.type === COMPONENT_TYPE.FRAGMENT_COMPONENT
    ? FragmentComponent
    : HostComponent)(element)
}
