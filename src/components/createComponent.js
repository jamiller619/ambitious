import { COMPONENT_TYPES } from '../utils'
import {
  CompoundComponent,
  HostComponent,
  TextComponent,
  FragmentComponent,
  RecycledComponent,
  EmptyComponent
} from './types'

const isDOMElement = t =>
  typeof t === 'object' && (t instanceof Element || t instanceof HTMLDocument)

export default function createComponent(element, parentComponent) {
  if (element == null || element === false) {
    return new EmptyComponent(COMPONENT_TYPES.EMPTY, parentComponent)
  }

  return new (typeof element.type === 'function'
    ? CompoundComponent
    : typeof element === 'string' || typeof element === 'number'
    ? TextComponent
    : element.type === COMPONENT_TYPES.FRAGMENT
    ? FragmentComponent
    : isDOMElement(element.type)
    ? RecycledComponent
    : HostComponent)(element, parentComponent)
}
