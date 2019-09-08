import HostComponentBody from './HostComponent'
import CompoundComponentBody from './CompoundComponent'
import FragmentComponentBody from './FragmentComponent'
import COMPONENT_TYPE from './type'
import { extend } from '../AmbitiousComponent'

const HostComponent = extend(HostComponentBody)
const CompoundComponent = extend(CompoundComponentBody)
const FragmentComponent = extend(FragmentComponentBody)

const createComponent = element => {
  return new (typeof element.type === 'function'
    ? CompoundComponent
    : element.type === COMPONENT_TYPE.FRAGMENT_COMPONENT
    ? FragmentComponent
    : HostComponent)(element)
}

export default createComponent
