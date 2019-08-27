import { onNextFrame, eventsKey, isArray, flatten } from './utils/shared'
import { EFFECT_TYPE, dispatchEffectHelper } from './components/hookUtils'

const XLINK_NS = 'http://www.w3.org/1999/xlink'
const reservedPropNames = ['children', 'useEffect']
const reservedAttributeNames = ['list', 'draggable', 'spellcheck', 'translate']

const isNullOrFalse = t => t == null || t === false || t === 'false' || t === 0

const eventProxy = event => {
  return event.currentTarget[eventsKey][event.type](event)
}

const createCSSValueIterator = value => {
  if (value == null || value === false) {
    return []
  }

  let classList = []

  if (isArray(value)) {
    classList = value.map(createCSSValueIterator)
  } else {
    classList = value
      .split(',')
      .join(' ')
      .split(' ')
      .map(className => className.trim())
      .filter(className =>
          className != null && className !== false && className !== '')
  }

  return flatten(classList)
}

// eslint-disable-next-line max-lines-per-function, max-statements, complexity, max-params
const updateProp = (node, key, value, namespace) => {
  if (key.startsWith('on')) {
    if (!node[eventsKey]) {
      node[eventsKey] = {}
    }

    const name = key.slice(2).toLowerCase()
    const isValueArray = isArray(value)
    const options = isValueArray ? value[1] : null

    if (value == null) {
      node.removeEventListener(name, eventProxy, options)
    } else if (node[eventsKey][name] == null) {
      node.addEventListener(name, eventProxy, options)
    }

    node[eventsKey][name] = isValueArray ? value[0] : value
  } else if (key === 'style') {
    if (typeof value === 'object') {
      Object.entries(value).forEach(([styleProp, styleValue]) => {
        if (node.style[styleProp] !== styleValue) {
          node.style[styleProp] = styleValue
        }
      })
    } else {
      node.style.cssText = value
    }
  } else if (key === 'class' || key === 'className') {
    const oldCssClasses = node.classList
    const newCssClasses = createCSSValueIterator(value)

    if (oldCssClasses.length === 0) {
      if (newCssClasses.length > 0) {
        newCssClasses.forEach(cssClass => {
          if (cssClass !== '') {
            node.classList.add(cssClass)
          }
        })
      }
    } else if (newCssClasses.length === 0) {
      node.classList.remove(...oldCssClasses)
    } else {
      new Set([...oldCssClasses, ...newCssClasses]).forEach(cssClass => {
        if (!newCssClasses.includes(cssClass)) {
          node.classList.remove(cssClass)
        } else if (cssClass !== '' && !oldCssClasses.contains(cssClass)) {
          node.classList.add(cssClass)
        }
      })
    }
  } else if (!reservedPropNames.includes(key)) {
    if (namespace) {
      const name = key.replace(/^xlink:?/u, '')
      const ns = namespace && key !== name

      if (ns) {
        if (isNullOrFalse(value)) {
          node.removeAttributeNS(XLINK_NS, name)
        } else if (
          !node.hasAttributeNS(XLINK_NS, name) ||
          (node.hasAttributeNS(XLINK_NS, name) &&
            node.getAttributeNS(XLINK_NS, name) != value)
        ) {
          node.setAttributeNS(XLINK_NS, name, value)
        }
      } else if (isNullOrFalse(value)) {
        node.removeAttribute(name)
      } else if (node.hasAttribute) {
        if (
          !node.hasAttribute(name) ||
          (node.hasAttribute(name) && node.getAttribute(name) != value)
        ) {
          node.setAttribute(name, value)
        }
      }
    } else if (
      key in node &&
      !reservedAttributeNames.includes(key) &&
      node[key] != value
    ) {
      node[key] = value == null ? '' : value === 'false' ? false : value
    }
  }
}

const waitForRenderedNode = node => {
  return new Promise(resolve => {
    const interval = window.setInterval(() => {
      if (node && node.isConnected === true) {
        window.clearInterval(interval)
        resolve(node)
      }
    }, 20)
  })
}

const renderer = {
  isRendered: node => {
    return node && node.isConnected
  },

  whenRendered: async (node, callback) => {
    if (!renderer.isRendered(node)) {
      await waitForRenderedNode(node)
    }

    return callback.call(callback, node)
  },

  renderNode: component => {
    const { element, parent } = component

    // Check if HTML
    if (element.type instanceof Element) {
      return element.type
    }

    component.namespace =
      (parent && parent.namespace) || (element.props && element.props.xmlns)
    if (element.type === 'svg') {
      component.namespace = 'http://www.w3.org/2000/svg'
    }

    return renderer.updateProps(
      component.namespace
        ? document.createElementNS(component.namespace, element.type)
        : document.createElement(element.type),
      null,
      element,
      component.namespace
    )
  },

  async replaceChild (parentComponent, newChildComponent, oldChildComponent) {
    await dispatchEffectHelper(oldChildComponent, EFFECT_TYPE.CLEANUP)

    await onNextFrame(async () => {
      const oldNode = oldChildComponent.getNode()

      if (!oldNode.parentNode) {
        await waitForRenderedNode(oldNode)
      }

      const newNode = newChildComponent.render(parentComponent)

      oldNode.parentNode.replaceChild(newNode, oldNode)
    })

    return dispatchEffectHelper(newChildComponent, EFFECT_TYPE.RESOLVED)
  },

  appendChild: (parentComponent, childComponent) => {
    if (!childComponent) return null
    const childNode = childComponent.render(parentComponent)

    onNextFrame(() => {
      const parentNode = parentComponent.getNode()

      if (childNode && parentNode) {
        parentNode.appendChild(childNode)
      }
    })

    return dispatchEffectHelper(childComponent, EFFECT_TYPE.RESOLVED)
  },

  removeChild: async (parentComponent, childComponent) => {
    await dispatchEffectHelper(childComponent, EFFECT_TYPE.CLEANUP)

    return onNextFrame(() => {
      const parentNode = parentComponent.getNode()
      const childNode = childComponent.getNode()

      if (childNode.isConnected && parentNode === childNode.parentNode) {
        parentNode.removeChild(childNode)
      }
    })
  },

  insertBefore: async (
    parentComponent,
    newChildComponent,
    referenceComponent
  ) => {
    await onNextFrame(() => {
      const newNode = newChildComponent.render(parentComponent)
      const refNode = referenceComponent.getNode()
      const parentNode = parentComponent.getNode()

      parentNode.insertBefore(newNode, refNode)
    })

    return dispatchEffectHelper(newChildComponent, EFFECT_TYPE.RESOLVED)
  },

  createTextNode: text => document.createTextNode(text),

  // eslint-disable-next-line max-params
  updateProps: (node, oldElement, newElement, namespace) => {
    const merged = {
      ...oldElement && oldElement.props,
      ...newElement && newElement.props
    }

    onNextFrame(() => {
      // eslint-disable-next-line guard-for-in
      for (const attribute in merged) {
        updateProp(node, attribute, merged[attribute], namespace)
      }
    })

    return node
  }
}

export default renderer
