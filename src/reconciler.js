import { onNextFrame, eventsKey, isArray, flatten } from './utils/shared'
import { EFFECT_TYPE, dispatchEffectHelper } from './components/hookUtils'

const XLINK_NS = 'http://www.w3.org/1999/xlink'
const reservedPropNames = ['children', 'useEffect']
const reservedAttributeNames = ['list', 'draggable', 'spellcheck', 'translate']

const isHTMLElement = obj => obj instanceof Element
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
const updateProp = (node, propName, value, namespace) => {
  if (propName.startsWith('on')) {
    if (!node[eventsKey]) {
      node[eventsKey] = {}
    }

    const name = propName.slice(2).toLowerCase()
    const isValueArray = isArray(value)
    const options = isValueArray ? value[1] : null

    if (value == null) {
      node.removeEventListener(name, eventProxy, options)
    } else if (node[eventsKey][name] == null) {
      node.addEventListener(name, eventProxy, options)
    }

    node[eventsKey][name] = isValueArray ? value[0] : value
  } else if (propName === 'style') {
    if (typeof value === 'object') {
      Object.entries(value).forEach(([styleProp, styleValue]) => {
        if (node.style[styleProp] !== styleValue) {
          node.style[styleProp] = styleValue
        }
      })
    } else {
      node.style.cssText = value
    }
  } else if (propName === 'class' || propName === 'className') {
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
  } else if (!reservedPropNames.includes(propName)) {
    if (namespace) {
      const name = propName.replace(/^xlink:?/u, '')
      const ns = namespace && propName !== name

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
      propName in node &&
      !reservedAttributeNames.includes(propName) &&
      node[propName] != value
    ) {
      node[propName] = value == null ? '' : value === 'false' ? false : value
    } else if (propName.startsWith('data-')) {
      node.dataset[propName.substring(5)] = value
    }
  }
}

const checkRender = (component, resolve) => {
  if (reconciler.isRendered(component)) {
    resolve(component.getNode())
  }
}

const reconciler = {
  isRendered: component => {
    const node = component.getNode()

    return (
      node &&
      (node.nodeType === 11 ? node.childElementCount === 0 : node.isConnected)
    )
  },

  whenNodeAttached: (node, callback) =>
    reconciler.waitForAttachedNode(node).then(callback),

  waitForAttachedNode: component => {
    return new Promise(resolve => {
      checkRender(component, resolve)

      const interval = window.setInterval(() => {
        if (reconciler.isRendered(component)) {
          window.clearInterval(interval)
          resolve(component.getNode())
        }
      }, 20)

      window.setTimeout(() => {
        window.clearInterval(interval)
        checkRender(component, resolve)
      }, 500)
    })
  },

  renderNode: component => {
    const { element, parent } = component

    if (isHTMLElement(element.type)) {
      return element.type
    }

    component.namespace =
      (parent && parent.namespace != null && parent.namespace) ||
      (element.props && element.props.xmlns) ||
      (element.type === 'svg' && 'http://www.w3.org/2000/svg') ||
      null

    return reconciler.updateProps(
      component.namespace
        ? document.createElementNS(component.namespace, element.type)
        : document.createElement(element.type),
      null,
      element,
      component.namespace
    )
  },

  replaceChild: (parentComponent, newChildComponent, oldChildComponent) => {
    return dispatchEffectHelper(oldChildComponent, EFFECT_TYPE.CLEANUP)
      .then(() =>
        onNextFrame(() => {
          const oldNode = oldChildComponent.getNode()

          const newNode = newChildComponent.render(parentComponent)

          oldNode.parentNode.replaceChild(newNode, oldNode)
        }))
      .then(() => dispatchEffectHelper(newChildComponent, EFFECT_TYPE.RESOLVED))
  },

  appendChild: (parentComponent, childComponent) => {
    const childNode = childComponent.render(parentComponent)

    return onNextFrame(() => {
      const parentNode = parentComponent.getNode()

      if (childNode && parentNode) {
        parentNode.appendChild(childNode)
      }
    }).then(() => dispatchEffectHelper(childComponent, EFFECT_TYPE.RESOLVED))
  },

  removeChild: childComponent => {
    return dispatchEffectHelper(childComponent, EFFECT_TYPE.CLEANUP)
      .then(() => reconciler.waitForAttachedNode(childComponent))
      .then(childNode =>
        onNextFrame(() => childNode.parentNode.removeChild(childNode)))
  },

  insertBefore: (parentComponent, newChildComponent, referenceComponent) => {
    return onNextFrame(() => {
      const newNode = newChildComponent.render(parentComponent)

      if (newNode) {
        const refNode = referenceComponent.getNode()

        refNode.parentNode.insertBefore(newNode, refNode)
      }
    }).then(() => dispatchEffectHelper(newChildComponent, EFFECT_TYPE.RESOLVED))
  },

  updateTextNode: (component, textContent) => {
    component.getNode().textContent = component.element = textContent
  },

  createTextNode: text => document.createTextNode(text),

  // eslint-disable-next-line max-params
  updateProps: (node, oldElement, newElement, namespace) => {
    if (node && node.nodeType !== Node.TEXT_NODE) {
      const merged = Object.assign(
        {},
        oldElement && oldElement.props,
        newElement && newElement.props
      )

      onNextFrame(() => {
        // eslint-disable-next-line guard-for-in
        for (const attribute in merged) {
          updateProp(node, attribute, merged[attribute], namespace)
        }
      })
    }

    return node
  }
}

export default reconciler
