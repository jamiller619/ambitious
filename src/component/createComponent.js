import CompoundComponent from './CompoundComponent'
import HostComponent from './HostComponent'

const createComponent = element => {
  return new (typeof element.type === 'function'
    ? CompoundComponent
    : HostComponent)(element)
}

export default createComponent
