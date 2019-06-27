import {
  flatten,
  eventsKey,
  eventProxy,
  isNullOrFalse,
  XLINK_NS,
  isArray
} from './utils'
import createElement from './createElement'
import createComponent from './components/createComponent'

export const mount = async (element, containerNode) => {
  if (containerNode.firstChild) {
    while (containerNode.firstChild) {
      containerNode.removeElement(containerNode.firstChild)
    }
  }

  const rootElement = createElement(containerNode)
  const root = createComponent(rootElement)

  await root.appendChild(element)

  return root
}

export const patch = diffs => {
  return new Promise(resolve => {
    window.requestAnimationFrame(async () => {
      const operations = flatten(diffs)

      if (operations.length > 0) {
        await Promise.all(
          operations.map(async diff =>
            diff != null && diff.action ? diff.action() : diff()
          )
        )
      }

      resolve()
    })
  })
}

export const diffChildren = (currentComponent, currentElement, nextElement) => {
  const queue = []
  const currentChildren = currentElement.props.children
  const nextChildren = nextElement.props.children

  let i = 0,
    length = nextChildren.length

  for (; i < length; i++) {
    const nextChild = nextChildren[i]
    const nextKey = nextChild.key || i

    // Find the cooresponding element in the current set of children
    const match = currentChildren.find((child, n) =>
      child.key ? child.key === nextKey : i === n
    )

    // If no match was found, this is a new node
    if (!match) {
      // If a current child exists at the current index,
      // insert the new child immediately before that node
      // If there is no current child, append it
      const currentChild = currentChildren[i]

      if (currentChild) {
        currentComponent.insertBefore(nextChild, currentChildren[i])
      } else {
        currentComponent.appendChild(nextChild)
      }
    } else {
      // We found a match, let the component handle the update
      currentComponent.updateChild(match, nextChild)
    }
  }

  const remainingChildren = currentChildren.slice(i)

  if (remainingChildren.length) {
    currentChildren.forEach(child => currentComponent.removeChild(child))
  }

  currentComponent.element = nextElement

  return queue
}

const reservedPropNames = ['list', 'draggable', 'spellcheck', 'translate']

export const updateProps = (node, oldElement, newElement, isSvg) => {
  const merged = Object.assign({}, (oldElement || {}).props, newElement.props)

  for (const attribute in merged) {
    updateProp(node, attribute, merged[attribute], isSvg)
  }
}

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

export const dispatchEvent = async (type, node) => {
  // const eventHandler = node[eventsKey] && node[eventsKey][type]

  // if (eventHandler) {
  //   return eventHandler.call(node, node)
  // }
  //
  return null
}

export const dispatchEvents = async (type, component) => {
  // type = type.toLowerCase()
  // const node = component.getNode()

  // await Promise.all(
  //   component
  //     .getChildren()
  //     .filter(child => child.$$typeof !== COMPONENT_TYPES.TEXT)
  //     .map(child => dispatchEvents(type, child))
  // )

  // if (node) {
  //   return dispatchEvent(type, node)
  // }
  return null
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
