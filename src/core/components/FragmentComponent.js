import AmbitiousComponent from './AmbitiousComponent'
import HostComponent from './HostComponent'
import renderElement from '../renderElement'
import { COMPONENT_TYPE } from './types'
import { merge } from '../../shared/utils'
import { areElementsEqual } from '../AmbitiousElement'

function FragmentComponent (element) {
  HostComponent.call(this, element)
}

export default merge(HostComponent, FragmentComponent, {
  $$typeof: COMPONENT_TYPE.FRAGMENT_COMPONENT,

  update (nextElement) {
    const prevElement = this.element

    this.element = nextElement

    if (areElementsEqual(prevElement, nextElement)) {
      return this.updateChildren(nextElement)
    }

    const myIndex = this.parent.getChildren().findIndex(child => child === this)
    const newComponent = renderElement(nextElement)
    const removeChildren = this.getChildren().map(child =>
      this.removeChild(child))

    return Promise.all(removeChildren).then(() => {
      this.parent.children.splice(myIndex, 1)

      return this.parent.insertBefore(newComponent, myIndex)
    })
  },

  render (parent) {
    this.node = document.createDocumentFragment()
    this.appendChildren()

    AmbitiousComponent.prototype.render.call(this, parent)

    return this.node
  }
})
