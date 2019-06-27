import createElement from './createElement'
import { mount } from './render'
import { COMPONENT_TYPES } from './utils'

const Fragment = COMPONENT_TYPES.FRAGMENT

const app = {
  createElement,
  mount,
  Fragment
}

export { app as default, Fragment }
