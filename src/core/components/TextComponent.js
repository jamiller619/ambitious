import AmbitiousComponent from './AmbitiousComponent'
import { COMPONENT_TYPE } from './types'
import { merge } from '../../shared/utils'
import { renderer } from '../../renderer'

function TextComponent (element) {
  AmbitiousComponent.call(this, element)
}

export default merge(AmbitiousComponent, TextComponent, {
  $$typeof: COMPONENT_TYPE.TEXT_COMPONENT,

  getNode () {
    return this.node
  },

  getChildren () {
    return []
  },

  update (nextElement) {
    if (this.element.toString() !== nextElement.toString()) {
      this.element = nextElement

      renderer.updateTextNode(this.node, nextElement)
    }
  },

  render (parent) {
    AmbitiousComponent.prototype.render.call(this, parent)

    return this.node = renderer.createTextNode(this.element)
  }
})
