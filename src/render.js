import { isArray, flatten, eventsKey } from './utils'
import createComponent from './component/createComponent'

const XLINK_NS = 'http://www.w3.org/1999/xlink'

const eventProxy = event => {
  return event.currentTarget[eventsKey][event.type](event)
}

const isNullOrFalse = t => t == null || t === false || t === 'false' || t === 0
const reservedPropNames = ['list', 'draggable', 'spellcheck', 'translate']

const updateProp = (node, key, value, isSvg) => {
  if (key.startsWith('on')) {
    if (!node[eventsKey]) {
      node[eventsKey] = {}
    }

    const name = key.slice(2).toLowerCase()

    if (value == null) {
      node.removeEventListener(name, eventProxy)
    } else if (node[eventsKey][name] == null) {
      node.addEventListener(name, eventProxy)
    }

    node[eventsKey][name] = value
  } else if (node.nodeType !== 11) {
    if (key === 'style') {
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
    } else if (key !== 'children') {
      if (isSvg === false) {
        if (
          key in node &&
          !reservedPropNames.includes(key) &&
          node[key] != value
        ) {
          node[key] = value == null ? '' : value === 'false' ? false : value
        }
      } else {
        const name = key.replace(/^xlink:?/, '')
        const ns = isSvg && key !== name

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
        } else {
          if (isNullOrFalse(value)) {
            node.removeAttribute(name)
          } else if (node.hasAttribute) {
            if (
              !node.hasAttribute(name) ||
              (node.hasAttribute(name) && node.getAttribute(name) != value)
            ) {
              node.setAttribute(name, value)
            }
          }
        }
      }
    }
  }
}

const createCSSValueIterator = value => {
  if (value == null || value === false) {
    return []
  }

  let classList = []

  if (isArray(value)) {
    classList = value.map(className => createCSSValueIterator(className))
  } else {
    classList = value
      .split(',')
      .join(' ')
      .split(' ')
      .map(className => className.trim())
      .filter(
        className =>
          className != null && className !== false && className !== ''
      )
  }

  return flatten(classList)
}

export const updateProps = (node, oldElement, newElement, isSvg) => {
  isSvg = isSvg || newElement.type === 'svg'

  const merged = Object.assign({}, (oldElement || {}).props, newElement.props)

  for (const attribute in merged) {
    updateProp(node, attribute, merged[attribute], isSvg)
  }

  return node
}

export const mount = (element, node) => {
  if (node.lastChild) {
    while (node.lastChild) {
      node.removeChild(node.lastChild)
    }
  }

  const component = createComponent(element)

  node.appendChild(component.render())

  return component
}
