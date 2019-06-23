import createElement from './element'
import { mount } from './render'
import { COMPONENT_TYPES } from './utils'

const Fragment = COMPONENT_TYPES.FRAGMENT

const ambitious = {
  createElement,
  Fragment
}

export { ambitious as default, mount, Fragment }
