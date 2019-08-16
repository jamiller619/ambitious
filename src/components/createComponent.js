import CompoundComponent from './CompoundComponent'
import HostComponent from './HostComponent'

// eslint-disable-next-line require-jsdoc
export default function createComponent (element) {
  return new (typeof element.type === 'function'
    ? CompoundComponent
    : HostComponent)(element)
}
