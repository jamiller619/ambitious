import AmbitiousComponent from './AmbitiousComponent'
import { areElementsEqual } from '../AmbitiousElement'
import { renderer } from '../../renderer'
import renderElement from '../renderElement'
import { COMPONENT_TYPE, EVENT_TYPE } from './types'
import { merge } from '../../shared/utils'
import queue from '../../shared/Queue'

/**
 * The Host Component represents a native view element
 * @param {AmbitiousElement} element The element from which this Component is based
 * @returns {HostComponent} Returns a new HostComponent instance
 */
function HostComponent (element) {
  AmbitiousComponent.call(this, element)
  this.children = element.props ? element.props.children.map(renderElement) : []
}

export default merge(AmbitiousComponent, HostComponent, {
  $$typeof: COMPONENT_TYPE.HOST_COMPONENT,

  getChildren () {
    return this.children
  },

  getNode () {
    return this.node
  },

  /**
   * Replaces a component with another
   * @param {AmbitiousComponent} newChild The new child component
   * @param {AmbitiousComponent} oldChild The old child component being replaced
   * @returns {Promise} A Promise that resolves when the operation is complete
   */
  replaceChild (newChild, oldChild) {
    return Promise.all([
      oldChild.dispatchEvents(EVENT_TYPE.BEFORE_DETACH),
      newChild.dispatchEvents(EVENT_TYPE.BEFORE_ATTACH)
    ])
      .then(() => {
        const oldChildIndex = this.children.findIndex(child => child === oldChild)
        const oldNode = oldChild.getNode()
        const newNode = newChild.render(this)
        const parentNode = (oldNode && oldNode.parentNode) || this.getNode()

        renderer.replaceChild(parentNode, newNode, oldNode)

        this.children[oldChildIndex] = newChild

        return Promise.resolve()
      })
      .then(() => {
        return Promise.all([
          oldChild.dispatchEvents(EVENT_TYPE.DETACH),
          newChild.dispatchEvents(EVENT_TYPE.ATTACH)
        ])
      })
  },

  insertBefore (newChild, refIndex) {
    if (this.children.length === refIndex) {
      return this.appendChild(newChild)
    }

    const refChild = this.children[refIndex]
    const newNode = newChild.render(this)

    return newChild
      .dispatchEvents(EVENT_TYPE.BEFORE_ATTACH)
      .then(() => {
        if (newNode) {
          renderer.insertBefore(
            refChild.getParentNode(),
            newNode,
            refChild.getNode()
          )
        }

        this.children.splice(refIndex, 0, newChild)

        return Promise.resolve()
      })
      .then(() => {
        return newChild.dispatchEvents(EVENT_TYPE.ATTACH)
      })
  },

  appendChild (newChild) {
    const childNode = newChild.render(this)

    return newChild
      .dispatchEvents(EVENT_TYPE.BEFORE_ATTACH)
      .then(() => {
        const parentNode = this.getNode()

        if (childNode) {
          renderer.appendChild(parentNode, childNode)
        }

        this.children.push(newChild)

        return Promise.resolve()
      })
      .then(() => {
        return newChild.dispatchEvents(EVENT_TYPE.ATTACH)
      })
  },

  removeChild (oldChild) {
    const oldChildIndex = this.children.findIndex(child => child === oldChild)
    const oldChildNode = oldChild.getNode()

    return oldChild
      .dispatchEvents(EVENT_TYPE.BEFORE_DETACH)
      .then(() => {
        const parentNode =
          (oldChildNode &&
            renderer.isAttached(oldChild) &&
            oldChildNode.parentNode) ||
          this.getNode()

        if (parentNode) {
          renderer.removeChild(parentNode, oldChildNode)
        }

        this.children.splice(oldChildIndex, 1)

        return Promise.resolve()
      })
      .then(() => {
        return oldChild.dispatchEvents(EVENT_TYPE.DETACH)
      })
  },

  update (nextElement) {
    const prevElement = this.element

    if (areElementsEqual(prevElement, nextElement)) {
      return queue
        .task(() => renderer.updateProps(this.node, prevElement, nextElement))
        .then(() => this.updateChildren(nextElement))
        .then(() => Promise.resolve(this.element = nextElement))
    }

    return this.parent
      ? this.parent.replaceChild(renderElement(nextElement), this)
      : Promise.resolve(null)
  },

  /* eslint-disable max-depth, eqeqeq */
  // eslint-disable-next-line max-lines-per-function, max-statements
  updateChildren (nextElement) {
    if (nextElement == null) {
      return queue.pool(() => this.parent.removeChild(this))
    }

    let i = 0
    const currentComponentChildren = this.getChildren()
    const nextElementChildren = nextElement.props.children
    const l = Math.max(
      currentComponentChildren.length,
      nextElementChildren.length
    )

    for (; i < l; i += 1) {
      const nextElementChild = nextElementChildren[i]

      if (!nextElementChild) {
        const currentChild = currentComponentChildren[i]

        if (currentChild) {
          queue.pool(() => this.removeChild(currentChild))
        }
      } else {
        const currentChild = nextElementChild.key
          ? currentComponentChildren.find(child => child.element.key === nextElementChild.key)
          : currentComponentChildren[i]

        if (currentChild) {
          if (
            typeof nextElementChild !== 'object' ||
            typeof currentChild !== 'object'
          ) {
            if (typeof currentChild.element !== 'object') {
              if (currentChild.element !== nextElementChild) {
                queue.pool(() => currentChild.update(nextElementChild))
              }
            } else {
              queue.pool(() =>
                this.replaceChild(renderElement(nextElementChild), currentChild))
            }
          } else if (
            areElementsEqual(currentChild.element, nextElementChild, {
              ignoreOrder: true
            })
          ) {
            queue.pool(() => currentChild.update(nextElementChild))
          } else {
            const nextElementChildMatch = nextElementChildren
              .slice(i)
              .findIndex(child =>
                areElementsEqual(child, currentChild.element, {
                  ignoreOrder: true
                }))

            if (nextElementChildMatch !== -1) {
              queue.pool(() => {
                this.insertBefore(
                  renderElement(nextElementChild),
                  nextElementChildMatch - 1
                )
              })
            } else {
              queue.pool(() => currentChild.update(nextElementChild))
            }
          }
        } else {
          queue.pool(() => this.appendChild(renderElement(nextElementChild)))
        }
      }
    }

    return queue
      .pool(() =>
        this.getChildren()
          .slice(i)
          .map(child => this.removeChild(child)))
      .flush()
  },
  /* eslint-enable max-depth, eqeqeq */

  render (parent) {
    AmbitiousComponent.prototype.render.call(this, parent)

    const { element } = this

    this.node = renderer.render(element.type, element.props, parent)

    const childNodes = this.children.map(child => child.render(this))

    renderer.appendChildren(this.getNode(), ...childNodes)

    return this.node
  }
})
