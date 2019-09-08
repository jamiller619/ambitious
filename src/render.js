import { createElement } from './AmbitiousElement'
import createComponent from './components/createComponent'

export default (element, parentNode) => {
  return new Promise(resolve => {
    const parentComponent = createComponent(createElement(parentNode))
    const childComponent = createComponent(element)

    parentComponent.children.push(childComponent)

    parentComponent.render()

    resolve(parentComponent)
  })
}
