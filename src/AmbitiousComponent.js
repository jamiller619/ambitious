import { freeze } from './utils/shared'

/**
 * Render/Update process in frames:
 * 1: Render an Element tree for Component
 * 2: Patch current DOM to match newly-rendered tree
 * 3: Run effect hooks for new tree
 */

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
