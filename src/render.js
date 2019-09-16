import { createElement } from './AmbitiousElement'
import { createComponent } from './AmbitiousComponent'

export default (element, parentNode) => {
  const parentComponent = createComponent(createElement(parentNode))
  const childComponent = createComponent(element)

  parentComponent.children.push(childComponent)

  parentComponent.render()

  return parentComponent
}
