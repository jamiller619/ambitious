import { COMPONENT_TYPES, isHTML } from '../utils'
import createComponent from './createComponent'

const getClosestParentNode = component => {
  const parentNode = component.parent.getNode()

  if (isHTML(parentNode)) {
    return parentNode
  }

  return getClosestParentNode(component.parent)
}

const EmptyComponent = {
  $$typeof: COMPONENT_TYPES.EMPTY,

  /**
   * This component's node refers to its parent's child at
   * the index this component would otherwise occupy.
   */
  // getNode() {
  //   const parentComponent = this.parent
  //   const parentsChildElements = parentComponent.element.props.children
  //   const index = parentsChildElements.findIndex(
  //     child => child.key === this.key
  //   )

  //   return parentComponent.getChildren()[index].getNode()
  // },
  getNode() {
    return this
  },

  getChildren() {
    return []
  },

  // This is a short cicuited method that gets called when
  // an update is attempting to be call replaceWith on a DOM
  // element! This happens because this.getNode returns this
  // instance.
  replaceWith(nextNode) {
    // if it so happens that nextNode is another EMPTY type,
    // just return since there will be no DOM to update
    if (nextNode.type === COMPONENT_TYPES.EMPTY) {
      return
    }

    const currentIndex = this.parent
      .getChildren()
      .findIndex(child => child === this)

    // Traverse up the tree to find the first container node
    const parentNode = getClosestParentNode(this)

    if (currentIndex <= parentNode.childNodes.length) {
      parentNode.insertBefore(nextNode, parentNode.childNodes[currentIndex])
    } else {
      parentNode.appendChild(nextNode)
    }
  },

  insertBefore(newElement) {
    console.log('inserting on empty')
    const { parent } = this
    const parentNode = parent.getNode()
    const index = parent.element.props.children.findIndex(
      child => child == null
    )
    const newComponent = createComponent(newElement, this.parent)
    const newNode = newComponent.render()

    if (parentNode.childNodes[index]) {
      parentNode.insertBefore(newNode, parentNode.childNodes[index])
    } else {
      parentNode.appendChild(newNode)
    }

    return newComponent
  },

  // insertBefore (newElement) {
  //   const parentNode = this.parent.getNode()
  //   const currentIndex = this.parent.getChildren().findIndex(child => child === this)
  //   const newComponent = renderComponent(newElement)
  //   const newNode = newComponent.render()

  //   if (currentIndex > -1) {

  //   } else {
  //     parentNode.appendChild()
  //   }
  //   const referenceChild =

  //   if (parentNode)
  // },

  // mount() {

  // },

  // unmount() {
  //   // Nothing to remove, just update the parent
  //   parent.
  // },

  render() {
    return document.createDocumentFragment()
  }
}

export default EmptyComponent
