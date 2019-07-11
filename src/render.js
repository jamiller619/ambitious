import {
  flatten,
  isNullOrFalse,
  XLINK_NS,
  isArray,
  COMPONENT_TYPES,
  UID,
  shouldReplaceElement
} from './utils'
import createComponent from './components/createComponent'
import createElement from './createElement'

// export const mount = async (element, containerNode) => {
//   if (containerNode.firstChild) {
//     while (containerNode.firstChild) {
//       containerNode.removeChild(containerNode.firstChild)
//     }
//   }

//   const app = createComponent(createElement(containerNode))

//   await app.appendChild(element)

//   return app
// }
const ROOT_KEY = `$$__ambitiousRoot${UID}`

export const mount = async (element, containerNode) => {
  const prevComponent = containerNode[ROOT_KEY]

  if (prevComponent) {
    return update(prevComponent, element)
  } else {
    const rootComponent = createComponent(createElement(containerNode))

    Object.defineProperty(containerNode, ROOT_KEY, {
      value: rootComponent
    })

    rootComponent.render()

    return appendComponent(element, rootComponent)
    // containerNode.appendChild(childComponent.getNode())
  }
  // if (containerNode.firstChild) {
  //   const rootNode = containerNode
  //   const rootComponent = rootNode[ROOT_KEY]

  //   if (rootComponent) {
  //     await rootComponent.update(element)
  //   } else {
  //     while (containerNode.firstChild) {
  //       containerNode.removeChild(containerNode.firstChild)
  //     }

  //     const component = createComponent(element)
  //     const node = component.render()

  //     Object.defineProperty(node, ROOT_KEY, {
  //       value: component
  //     })

  //     containerNode.appendComponent(node)
  //   }
  // }
}

const logComponent = component => {
  return component
  // component.displayName || `${component.$$typeof}:${component.element.type}`
}

const logElement = element => {
  return typeof element.type === 'function' ? element.type.name : element.type
}

export const update = async (currentComponent, nextElement) => {
  // If we're updating another component with "EMPTY",
  // we're really deleting it
  if (nextElement.type === COMPONENT_TYPES.EMPTY) {
    if (currentComponent.type !== COMPONENT_TYPES.EMPTY) {
      return currentComponent.replaceWith(nextElement)
    }

    currentComponent.element = nextElement

    return currentComponent
  }

  const currentNode = currentComponent.getNode()
  const currentElement = currentComponent.element

  if (shouldReplaceElement(currentElement, nextElement)) {
    return replaceComponent(nextElement, currentComponent)
  } else {
    updateProps(
      currentNode,
      currentElement,
      nextElement,
      currentComponent.isSvg
    )

    return patchChildren(currentComponent, nextElement)
  }
}

// export const updateComponent = async (component, prevElement) => {
//   updateProps(
//     component.getNode(),
//     prevElement,
//     component.element,
//     component.isSvg
//   )

//   return patchChildren()
// }

export const insertBefore = async (newElement, childReferenceComponent) => {
  console.log(
    `inserting ${logElement(newElement)} before ${logComponent(
      childReferenceComponent
    )}`
  )
  const referenceNode = childReferenceComponent.getNode()
  const parentNode = referenceNode.parentNode
  const newComponent = createComponent(newElement)
  const newNode = newComponent.render()

  // Append the child if parent doesn't have any children
  if (parentNode.childElementCount === 0) {
    parentNode.appendChild(newNode)
  } else {
    parentNode.insertBefore(newNode, referenceNode)
  }

  return newComponent
}

export const appendComponent = async (newElement, parentComponent) => {
  console.dir(
    `appending ${logElement(newElement)} to ${logComponent(parentComponent)}`
  )
  const parentNode = parentComponent.getNode()
  const newComponent = createComponent(newElement, parentComponent)
  const newNode = newComponent.render()

  parentNode.appendChild(newNode)

  return newComponent
}

export const removeComponent = async childComponent => {
  console.log(`removing ${logComponent(childComponent)}`)
  const childNode = childComponent.getNode()
  const parentNode = childNode.parentNode

  parentNode.removeChild(childNode)

  return childNode
}

export const replaceComponent = async (nextElement, prevComponent) => {
  console.log(
    `replacing ${logComponent(prevComponent)} with ${logElement(nextElement)}`
  )
  const nextComponent = createComponent(nextElement, prevComponent.parent)
  const nextNode = nextComponent.render()
  const prevNode = prevComponent.getNode()
  // const containerNode = prevNode.parentNode

  // containerNode.replaceChild(nextNode, prevNode)
  prevNode.replaceWith(nextNode)

  return nextComponent
}

export const patchChildren = async (currentComponent, nextElement) => {
  const currentChildComponents = currentComponent.getChildren()

  if (nextElement.type === COMPONENT_TYPES.EMPTY) {
    return
  }

  const nextElementChildren = nextElement.props.children

  let i = 0,
    length = nextElementChildren.length

  for (; i < length; i++) {
    const nextElementChild = nextElementChildren[i]

    const currentChildComponentMatch = currentChildComponents
      .slice(i)
      .find(
        child =>
          child.key === nextElementChild.key &&
          child.element.type === nextElementChild.type
      )

    if (currentChildComponentMatch) {
      currentChildComponentMatch.update(nextElementChild)
    } else {
      const currentChildComponent = currentChildComponents[i]

      if (currentChildComponent) {
        currentChildComponent.insertBefore(nextElementChild)
      } else {
        appendComponent(nextElementChild, currentComponent)
      }
    }
  }

  if (currentChildComponents.length > i) {
    await currentChildComponents[i].pop().remove()
  }

  currentComponent.element = nextElement

  return currentComponent
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

const eventsKey = `$$events__${UID}`
const eventProxy = event => {
  return event.currentTarget[eventsKey][event.type](event)
}

export const dispatchEvent = async (type, node) => {
  const eventHandler = node[eventsKey] && node[eventsKey][type]

  if (eventHandler) {
    return eventHandler.call(node, node)
  }
}

export const dispatchEvents = async (type, component) => {
  const t = type.toLowerCase()
  const node = component.getNode()
  const children = component
    .getChildren()
    .filter(child => child.$$typeof !== COMPONENT_TYPES.TEXT)

  await Promise.all(children.map(child => dispatchEvents(t, child)))

  if (node) {
    return dispatchEvent(t, node)
  }
}
