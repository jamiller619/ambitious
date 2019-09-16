import { createElement } from './AmbitiousElement'
import render from './render'
import COMPONENT_TYPE from './components/types'

const Fragment = COMPONENT_TYPE.FRAGMENT_COMPONENT

const ambitious = {
  createElement,
  render,
  Fragment
}

export { ambitious as default, render, Fragment }
