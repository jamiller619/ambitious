import { generateId, isArray, flatten, hasOwnProperty } from '../shared/utils'

const XLINK_NS = 'http://www.w3.org/1999/xlink'
const XHTML_NS = 'http://www.w3.org/1999/xhtml'
const SVG_NS = 'http://www.w3.org/2000/svg'

const reservedPropNames = ['children', 'useEffect']
const reservedAttributeNames = ['list', 'draggable', 'spellcheck', 'translate']

const isHTMLElement = obj => obj instanceof Element
const isNullOrFalse = t => t == null || t === false || t === 'false' || t === 0

const eventsKey = `$$__events${generateId()}`
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

/* eslint-disable eqeqeq */
// eslint-disable-next-line max-statements, complexity, max-lines-per-function, max-params
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
  } else if (propName === 'ref') {
    if (typeof value === 'function') {
      value(node)
    } else if (hasOwnProperty.call(value, 'current')) {
      value.current = node
    } else {
      throw Error(`The "ref" prop must be a function, instead of type "${typeof value}"`)
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
/* eslint-enable eqeqeq */

const Renderer = {
  isAttached (component) {
    const node = component.getNode()

    return node ? node.nodeType === 11 ? true : node.isConnected : false
  },

  render (type, props, parent) {
    if (isHTMLElement(type)) {
      return type
    }

    const namespace =
      (props && props.xmlns) ||
      (type === 'svg' && SVG_NS) ||
      (parent && parent.namespaceURI !== XHTML_NS && parent.namespaceURI) ||
      null

    const node = namespace
      ? document.createElementNS(namespace, type)
      : document.createElement(type)

    this.updateProps(node, null, props, namespace)

    return node
  },

  replaceChild (parentNode, newChildNode, oldChildNode) {
    parentNode.replaceChild(newChildNode, oldChildNode)
  },

  appendChild (parentNode, childNode) {
    if (parentNode) parentNode.appendChild(childNode)
  },

  appendChildren (parentNode, ...childNodes) {
    parentNode.append(...childNodes)
  },

  removeChild (parentNode, childNode) {
    if (parentNode.isConnected && childNode.parentNode === parentNode) {
      parentNode.removeChild(childNode)
    }
  },

  insertBefore: (parentNode, childNode, refChildNode) => {
    parentNode.insertBefore(childNode, refChildNode)
  },

  updateTextNode (textNode, text) {
    textNode.textContent = text
  },

  createTextNode: text => document.createTextNode(text),

  // eslint-disable-next-line max-params
  updateProps (node, prevProps, newProps, namespace) {
    if (node && node.nodeType !== Node.TEXT_NODE) {
      const merged = Object.assign({}, prevProps, newProps)

      for (const attribute in merged) {
        if (hasOwnProperty.call(merged, attribute)) {
          updateProp(node, attribute, merged[attribute], namespace)
        }
      }
    }
  }
}

export default Renderer
