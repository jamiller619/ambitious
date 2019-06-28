import createElement from './createElement'
import { mount } from './render'
import { COMPONENT_TYPES } from './utils'

const Fragment = COMPONENT_TYPES.FRAGMENT

const ambitious = {
  createElement,
  mount,
  Fragment
}

export { ambitious as default, mount, Fragment }
