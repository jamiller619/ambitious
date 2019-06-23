import { SVG_NS, COMPONENT_TYPES } from './utils'
import { updateProps, diff } from './reconciler'

export const mount = (element, containerNode) => {
  if (containerNode.firstChild) {
    while (containerNode.firstChild) {
      containerNode.removeElement(containerNode.firstChild)
    }
  }

  containerNode.append(render(element))

  return containerNode
}

export default function render(element, ...args) {
  const component = createComponent(element)
  return component.render(...args)
}

const createComponent = element => {
  return new (typeof element.type === 'function'
    ? CompoundComponent
    : typeof element === 'string' || typeof element === 'number'
    ? TextComponent
    : element.type === COMPONENT_TYPES.FRAGMENT
    ? FragmentComponent
    : HostComponent)(element)
}

function Component(element, $$typeof) {
  this.$$typeof = $$typeof
  this.element = element
  this.children = []
}

Component.prototype = {
  getHostNode() {
    return this.node.parentNode
  },
  async addChild(newChildComponent) {
    const host = this.getHostNode()

    host.appendChild(newChildComponent.render())

    this.children.push(newChildComponent)
  },
  async insertBefore(newChildComponent, referenceChildComponent) {
    const host = this.getHostNode()
    const refIndex = this.children.findIndex(
      child => child === referenceChildComponent
    )

    host.insertBefore(newChildComponent.render(), referenceChildComponent.node)

    this.children.splice(refIndex, 0, newChildComponent)
  },
  async replaceChild(newChildComponent, oldChildComponent) {
    const host = this.getHostNode()
    const childIndex = this.children.findIndex(
      child => child === oldChildComponent
    )

    host.replaceChild(newChildComponent.render(), oldChildComponent)

    this.children[childIndex] = newChildComponent
  },
  async removeChild(oldChildComponent) {
    const oldChildIndex = this.children.findIndex(
      child => child === oldChildComponent
    )

    this.getHostNode().removeChild(oldChildComponent)

    this.children.splice(oldChildIndex, 1)
  }
}

/**
 * Compound Component
 *
 */

function CompoundComponent(element) {
  Component.call(this, element, COMPONENT_TYPES.COMPOUND)

  this.state = element.type.defaultState || {}
  this.children = [this.createInstance()]
}

CompoundComponent.prototype = {
  render() {
    return this.children[0].render()
  },
  getHostNode() {
    return this.children[0].getHostNode()
  },
  get node() {
    return this.children[0].node
  },
  createInstance() {
    return createComponent(
      this.element.type(
        this.element.props,
        this.state,
        this.setState.bind(this)
      )
    )
  },
  async setState(newState) {
    const nextState = Object.assign({}, this.state, newState)

    if (nextState !== this.state) {
      this.state = nextState

      const prevInstance = this.children[0]
      const prevInstanceNode = prevInstance.node

      const nextInstance = this.createInstance()

      await diff(prevInstanceNode, this, prevInstance, nextInstance)()

      // console.log(prevInstance)
      // console.log(patched)

      // dispatchEvents(LIFECYCLE_EVENTS.UPDATE, this.element)
    }
  }
}

/**
 * Host Component
 *
 */

function HostComponent(element) {
  Component.call(this, element, COMPONENT_TYPES.HOST)

  if (element.props.children.length > 0) {
    this.children = element.props.children.map(child => createComponent(child))
  }
}

HostComponent.prototype = {
  render(isSvg = false) {
    const { element } = this
    const isNodeSvg =
      isSvg || (element && element.type && element.type.toLowerCase() === 'svg')
    const node = (this.node = isNodeSvg
      ? document.createElementNS(SVG_NS, element.type)
      : document.createElement(element.type))

    updateProps(node, null, element, isNodeSvg)

    node.append(...this.children.map(component => component.render(isNodeSvg)))

    return (this.node = node)
  }
}

/**
 * Text Component
 *
 */

function TextComponent(element) {
  Component.call(this, element, COMPONENT_TYPES.TEXT)
  this.text = element
}

TextComponent.prototype = {
  render() {
    return (this.node = document.createTextNode(this.text))
  },
  update(nextComponent) {
    this.text = this.node.textContent = this.element = nextComponent.element
  }
}

/**
 * Fragment Component
 *
 */

function FragmentComponent(element) {
  Component.call(this, element, COMPONENT_TYPES.FRAGMENT)
  this.children = [this.createInstance()]
}

FragmentComponent.prototype = {
  render() {
    const container = document.createDocumentFragment()

    container.append(...this.children.map(child => child.render()))

    return container
  },
  get node() {
    return this.children[0].node
  },
  createInstance() {
    return this.children.map(child => createComponent(child))
  }
}

const ComponentProto = () => Object.create(Component.prototype)

const assignComplete = (target, ...sources) => {
  sources.forEach(source => {
    let descriptors = Object.keys(source).reduce((descriptors, key) => {
      descriptors[key] = Object.getOwnPropertyDescriptor(source, key)
      return descriptors
    }, {})
    // by default, Object.assign copies enumerable Symbols too
    Object.getOwnPropertySymbols(source).forEach(sym => {
      let descriptor = Object.getOwnPropertyDescriptor(source, sym)
      if (descriptor.enumerable) {
        descriptors[sym] = descriptor
      }
    })
    Object.defineProperties(target, descriptors)
  })

  return target
}

assignComplete(ComponentProto(), CompoundComponent.prototype)
assignComplete(ComponentProto(), HostComponent.prototype)
assignComplete(ComponentProto(), TextComponent.prototype)
