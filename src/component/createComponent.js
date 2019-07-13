import CompoundComponent from './CompoundComponent'
import HostComponent from './HostComponent'

export default function createComponent(element) {
  return typeof element.type === 'function'
    ? new CompoundComponent(element)
    : new HostComponent(element)
}
