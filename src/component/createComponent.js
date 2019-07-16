import CompoundComponent from './CompoundComponent'
import HostComponent from './HostComponent'
import { isArray } from 'util'

const render = element =>
  typeof element.type === 'function'
    ? new CompoundComponent(element)
    : new HostComponent(element)

/**
 * create a Component instance from an Element
 *
 * @param {Element} element source element
 * @return {Component} a new Compound or Host Component object
 */
export default function createComponent (elements) {
  return isArray(elements)
    ? elements.map(element => render(element))
    : render(elements)
}
