import { createElement } from './AmbitiousElement'
import renderElement from './renderElement'
import { EVENT_TYPE } from './components/types'

const render = (element, parentNode) => {
  const parentComponent = renderElement(createElement(parentNode))
  const childComponent = renderElement(element)

  parentComponent.children.push(childComponent)

  parentComponent.render()

  parentComponent.dispatchEvents(EVENT_TYPE.ATTACH).then(() => {
    return parentComponent.dispatchEvents(EVENT_TYPE.RENDER_COMPLETE)
  })

  return parentComponent
}

export default render
