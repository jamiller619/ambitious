import StateComponent from './StateComponent'
import HostComponent from './HostComponent'

export const createComponent = element => {
  return typeof element.type === 'function'
    ? new StateComponent(element)
    : new HostComponent(element)
}
