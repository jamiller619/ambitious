import createElement from './createElement'
import createComponent from './components/createComponent'

const render = (element, parentNode, component) => {
  if (component) {
    return component.update(element)
  }

  return Promise.resolve(createComponent(element).mount(parentNode))
}

const ambitious = {
  createElement,
  render
}

export { ambitious as default, render }
