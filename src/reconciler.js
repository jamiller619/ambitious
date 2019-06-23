import {
  isArray,
  flatten,
  XLINK_NS,
  eventsKey,
  isNullOrFalse,
  COMPONENT_TYPES
} from './utils'

export const diff = (node, parentComponent, hostComponent, nextComponent) => {
  const diffs = flatten(
    diffElements(
      node,
      parentComponent,
      hostComponent,
      nextComponent,
      node.nodeName === 'svg'
    )
  )

  return async () => {
    return new Promise(resolve => {
      window.requestAnimationFrame(async () => {
        await Promise.all(diffs.map(async diff => diff()))

        resolve(nextComponent)
      })
    })
  }
}

const diffElements = (
  node,
  parentComponent,
  hostComponent,
  nextComponent,
  isSvg = false
) => {
  const queue = []

  if (hostComponent == null || hostComponent.element == null || node == null) {
    queue.push(async () =>
      parentComponent.insertBefore(nextComponent, hostComponent)
    )
  } else if (
    hostComponent.$$typeof === COMPONENT_TYPES.TEXT &&
    nextComponent.$$typeof === COMPONENT_TYPES.TEXT
  ) {
    if (hostComponent.text !== nextComponent.text) {
      queue.push(() => {
        hostComponent.update(nextComponent)
      })
    }
  } else if (
    hostComponent.type !== nextComponent.type ||
    !hasMatchingKeys(hostComponent, nextComponent, 0, 0)
  ) {
    queue.push(async () => parentComponent.replaceChild(nextComponent, node))
  } else {
    queue.push(() =>
      updateProps(node, hostComponent.element, nextComponent.element, isSvg)
    )

    const nextChildren = nextComponent.children
    const prevChildren = hostComponent.children

    let i = 0,
      length = nextChildren.length

    for (; i < length; i++) {
      const newChild = nextChildren[i]

      const match = prevChildren.find((child, n) =>
        hasMatchingKeys(child, newChild, n, i)
      )

      if (!match) {
        const oldChild = prevChildren[i]

        if (oldChild) {
          const nextChildMatch = nextChildren.find((child, n) =>
            hasMatchingKeys(child, oldChild, n, i)
          )

          if (nextChildMatch) {
            queue.push(async () => hostComponent.addChild(newChild, oldChild))
          } else {
            const childNode = oldChild.node

            queue.push(
              ...diffElements(
                childNode,
                hostComponent,
                oldChild,
                newChild,
                isSvg || childNode.nodeName === 'svg'
              )
            )
          }
        } else {
          queue.push(async () => hostComponent.addChild(node, newChild))
        }
      } else {
        const childNode = match.node

        queue.push(
          ...diffElements(
            childNode,
            hostComponent,
            match,
            newChild,
            isSvg || childNode.nodeName === 'svg'
          )
        )
      }
    }

    queue.push(async () => {
      await Promise.all(
        prevChildren
          .slice(i)
          .map(async child => hostComponent.removeChild(child))
      )
    })
  }

  return queue
}

const eventProxy = event => {
  return event.currentTarget[eventsKey][event.type](event)
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

    const name = key.slice(2)

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
        newCssClasses.forEach(cssClass => {
          if (cssClass !== '') {
            node.classList.add(cssClass)
          }
        })
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
      if (!isSvg && key in node && !reservedPropNames.includes(key)) {
        if (node[key] != value) {
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

const hasMatchingKeys = (a, b, ai, bi) => {
  const akey = a.element.key || ai
  const bkey = b.element.key || bi

  return a && b && akey === bkey
}

const dispatchEvent = async (type, element) => {
  const eventHandler =
    element.node && element.node[eventsKey] && element.node[eventsKey][type]

  if (eventHandler) {
    return eventHandler(element.node)
  }
}

export const dispatchEvents = async (type, element) => {
  return null
  await Promise.all(
    element.props.children.map(child => dispatchEvents(type, child))
  )

  return dispatchEvent(type, element)
}

const removeEventListeners = element => {
  for (const eventType in element.node[eventsKey]) {
    delete element.node[eventsKey][eventType]
    element.node.removeEventListener(eventType, eventProxy)
  }
}

const createCSSValueIterator = value => {
  if (isNullOrFalse(value)) {
    return []
  }

  if (isArray(value)) {
    return flatten(value.filter(cssClass => createCSSValueIterator(cssClass)))
  }

  if (typeof value === 'string') {
    return value
      .trim()
      .split(' ')
      .filter(cssClass => !isNullOrFalse(cssClass))
  }
}
