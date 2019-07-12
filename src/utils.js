export const T = {
  ELEMENT: Symbol('ambitious.element'),
  COMPONENT: Symbol('ambitious.component'),
  FRAGMENT: Symbol('ambitious.fragment')
}

export const EVENTS = {
  ATTACH: 'attach',
  BEFORE_ATTACH: 'beforeattach',
  DETACH: 'detach',
  BEFORE_DETACH: 'beforedetach',
  CATCH: 'catch',
  RENDER: 'render'
}

// export const Fragment = T.FRAGMENT

// simple random id generator
const generateId = () =>
  Math.random()
    .toString(36)
    .replace('0.', '')

export const eventsKey = `$$events__${generateId()}`

export const freeze = Object.freeze ? obj => Object.freeze(obj) : obj => obj
export const isArray = Array.isArray
export const flatten = arr =>
  arr.reduce(
    (acc, val) => (isArray(val) ? acc.concat(flatten(val)) : acc.concat(val)),
    []
  )
export const ieTextElement = element =>
  typeof element === 'string' || typeof element === 'number'

export const isComponent = element => element.$$typeof === T.COMPONENT

export const getElement = element => {
  if (isComponent(element)) {
    return getElement(element.renderedElement)
  }

  return element
}

export const getChildren = element => getProps(element).children

export const getProps = element => {
  if (isComponent(element)) {
    return getProps(element.renderedElement)
  }

  return element.props
}

// const dispatchEvent = async (type, node) => {
//   await Promise.all(
//     [...node.childNodes].map(childNode => dispatchEvent(type, childNode))
//   )

//   const eventHandler = node[eventsKey] && node[eventsKey][type]

//   if (eventHandler) {
//     return eventHandler(node)
//   }
// }

// export const dispatchEvents = async (type, element) => {
//   if (!isComponent(element)) return

//   return dispatchEvent(type, element.node)
// }

// export const attach = async (element, node) => {
//   const renderedNode = renderElement(element)
//   await dispatchEvents(EVENTS.BEFORE_ATTACH, element)
//   node.appendChild(renderedNode)
//   dispatchEvents(EVENTS.ATTACH, element)
// }
