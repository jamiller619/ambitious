import HostComponent from './components/HostComponent'
import CompoundComponent from './components/CompoundComponent'
import FragmentComponent from './components/FragmentComponent'
import TextComponent from './components/TextComponent'
import { COMPONENT_TYPE } from './components/types'

const getComponentType = element => {
  if (element == null) return null
  if (typeof element.type === 'function') return CompoundComponent
  if (element.type === COMPONENT_TYPE.FRAGMENT_COMPONENT) return FragmentComponent
  if (typeof element === 'string' || typeof element === 'number') return TextComponent

  return HostComponent
}

const renderElement = element => {
  const Component = getComponentType(element)

  return Component ? new Component(element) : null
}

export default renderElement
