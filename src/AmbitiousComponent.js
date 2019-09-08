import { freeze } from './utils/shared'

export const extend = Base => {
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
