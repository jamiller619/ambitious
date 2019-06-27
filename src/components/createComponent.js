import { COMPONENT_TYPES } from '../utils'
import createElement from '../createElement'
import {
  CompoundComponent,
  HostComponent,
  TextComponent,
  FragmentComponent,
  RecycledComponent,
  EmptyComponent
} from './types'

const emptyElement = createElement([], { key: null })

const isDOMElement = t =>
  typeof t === 'object' && (t instanceof Element || t instanceof HTMLDocument)

export default function createComponent(element, parentComponent) {
  return new (element == null
    ? EmptyComponent
    : typeof element.type === 'function'
    ? CompoundComponent
    : typeof element === 'string' || typeof element === 'number'
    ? TextComponent
    : element.type === COMPONENT_TYPES.FRAGMENT
    ? FragmentComponent
    : isDOMElement(element.type)
    ? RecycledComponent
    : HostComponent)(element || emptyElement, parentComponent)
}
