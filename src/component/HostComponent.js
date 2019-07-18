/* eslint-disable no-loop-func */
/* eslint-disable max-statements */
import { areElementsEqual, EVENTS } from '../utils'
import { updateProps, dispatchEvents } from '../render'
import { inherit } from './BaseComponent'
import createComponent from './createComponent'

// eslint-disable-next-line max-lines-per-function
const updateChildren = (currentComponent, nextElement) => {
  const queue = []
  const currentComponentChildren = currentComponent.renderedChildren
  const nextElementChildren = nextElement.props.children

  let i = 0
  const l = nextElementChildren.length

  for (; i < l; i += 1) {
    const nextElementChild = nextElementChildren[i]

    if (typeof nextElementChild !== 'object') {
      const currentChild = currentComponentChildren[i]

      if (typeof currentChild.element !== 'object') {
        if (currentChild.element !== nextElementChild) {
          queue.push(() => {
            currentChild.getNode().textContent = currentChild.element = nextElementChild
          })
        }
      } else {
        queue.push(async () => {
          await currentComponent.replaceChild(
            createComponent(nextElementChild),
            currentChild
          )
        })
      }
    } else {
      const currentChildMatch = currentComponentChildren.find(child =>
        areElementsEqual(child.element, nextElementChild))

      if (currentChildMatch) {
        currentChildMatch.update(nextElementChild)
      } else {
        const currentComponentChild = currentComponentChildren[i]

        if (currentComponentChild) {
          const nextElementChildMatch = nextElementChildren
            .slice(i)
            .find(child =>
              areElementsEqual(child, currentComponentChild.element))

          // eslint-disable-next-line max-depth
          if (nextElementChildMatch) {
            queue.push(() => {
              return currentComponent.insertBefore(
                createComponent(nextElementChildMatch),
                i
              )
            })
          } else {
            currentComponentChild.update(nextElementChild)
          }
        } else {
          queue.push(() => {
            return currentComponent.appendChild(createComponent(nextElementChild))
          })
        }
      }
    }
  }

  queue.push(() => {
    return currentComponentChildren
      .slice(i)
      .map(child => currentComponent.removeChild(child))
  })

  return queue
}

const flushQueue = queue => {
  return new Promise(resolve => {
    window.requestAnimationFrame(async () => {
      await Promise.all(queue.map(work => work()))

      resolve()
    })
  })
}

export default inherit({
  $$typeof: 'HostComponent',
  construct (element) {
    this.node = null
    this.namespace = null

    if (typeof element === 'object') {
      this.renderedChildren = element.props.children.map(child =>
        createComponent(child))
    }
  },
  getChildren () {
    return this.renderedChildren
  },
  getNode () {
    return this.node
  },
  getChildIndex (child) {
    return this.renderedChildren.findIndex(c => c === child)
  },
  async replaceChild (newChild, oldChildIndex) {
    const oldChild = this.renderedChildren[oldChildIndex]
    const newNode = newChild.render(this)

    await Promise.all([
      dispatchEvents(EVENTS.BEFORE_ATTACH, newChild),
      dispatchEvents(EVENTS.BEFORE_DETACH, oldChild)
    ])

    this.renderedChildren[oldChildIndex] = newChild
    this.node.insertBefore(newNode, oldChild.getNode())

    dispatchEvents(EVENTS.ATTACH, newChild)
    dispatchEvents(EVENTS.DETACH, oldChild)
  },
  async insertBefore (newChild, referenceIndex) {
    const refChild = this.renderedChildren[referenceIndex]
    const newNode = newChild.render(this)

    await dispatchEvents(EVENTS.BEFORE_ATTACH, newChild)

    this.renderedChildren.splice(referenceIndex, 0, newChild)
    this.node.insertBefore(newNode, refChild.getNode())

    dispatchEvents(EVENTS.ATTACH, newChild)
  },
  async appendChild (newChild) {
    const newNode = newChild.render()

    await dispatchEvents(EVENTS.BEFORE_ATTACH, newChild)

    this.renderedChildren.push(newChild)
    this.node.appendChild(newNode)

    dispatchEvents(EVENTS.ATTACH, newChild)
  },
  async removeChild (oldChild) {
    const oldNode = oldChild.getNode()
    const oldChildIndex = this.renderedChildren.findIndex(child => child === oldChild)

    await dispatchEvents(EVENTS.BEFORE_DETACH, oldChild)

    this.renderedChildren.splice(oldChildIndex, 1)
    this.node.removeChild(oldNode)

    dispatchEvents(EVENTS.DETACH, oldChild)
  },
  async update (nextElement) {
    const prevElement = this.element

    this.element = nextElement

    updateProps(this.node, prevElement, this.element, this.namespace)

    const queue = updateChildren(this, nextElement)

    await flushQueue(queue)
  },
  render (parent, namespace) {
    this.parent = parent

    const { element } = this

    if (typeof element !== 'object') {
      return this.node = document.createTextNode(element)
    }

    this.namespace = namespace || element.props.xmlns
    if (element.type === 'svg') {
      this.namespace = 'http://www.w3.org/2000/svg'
    }

    const node = updateProps(
      this.namespace
        ? document.createElementNS(this.namespace, element.type)
        : document.createElement(element.type),
      null,
      element,
      this.namespace
    )

    node.append(...this.renderedChildren.map(child => child.render(this, this.namespace)))

    return this.node = node
  }
})
