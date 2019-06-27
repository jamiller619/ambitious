import { COMPONENT_TYPES, SVG_NS } from '../utils'
import { updateProps } from '../render'

const HostComponent = {
  $$typeof: COMPONENT_TYPES.HOST,

  render(isSvg) {
    const { element } = this

    this.isSvg =
      isSvg || (element && element.type && element.type.toLowerCase() === 'svg')

    const node = (this.node = this.isSvg
      ? document.createElementNS(SVG_NS, element.type)
      : document.createElement(element.type))

    updateProps(node, null, element, this.isSvg)

    this.children.forEach(child => {
      node.appendChild(child.render(this.isSvg))
    })

    return (this.node = node)
  }
}

export default HostComponent
