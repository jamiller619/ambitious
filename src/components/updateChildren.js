/* eslint-disable max-depth */
import { areElementsEqual } from '../utils/shared'
import createComponent from './createComponent'
import Queue from '../utils/Queue'

// eslint-disable-next-line max-params
const enqueueInsertBefore = (queue, component, index, nextElement) => {
  return queue.addTask(() => {
    return component.insertBefore(createComponent(nextElement), index)
  })
}

// eslint-disable-next-line max-lines-per-function, max-statements
export const updateChildren = (currentComponent, nextElement) => {
  const queue = new Queue()
  const currentComponentChildren = currentComponent.renderedChildren

  if (nextElement == null) {
    queue.addTask(() => currentComponent.parent.removeChild(currentComponent))

    return queue
  }

  const nextElementChildren = nextElement.props.children

  let i = 0
  const l = nextElementChildren.length

  for (; i < l; i += 1) {
    const nextElementChild = nextElementChildren[i]
    const currentChild = currentComponentChildren && currentComponentChildren[i]

    if (
      currentChild &&
      (typeof nextElementChild !== 'object' || typeof currentChild !== 'object')
    ) {
      if (typeof currentChild.element !== 'object') {
        if (currentChild.element !== nextElementChild) {
          queue.addTask(() =>
              currentChild.getNode().textContent = currentChild.element = nextElementChild)
        }
      } else {
        queue.addTask(() =>
          currentComponent.replaceChild(
            createComponent(nextElementChild),
            currentChild
          ))
      }
    } else {
      const currentChildMatch = currentComponentChildren.find(child =>
        areElementsEqual(child.element, nextElementChild))

      if (currentChildMatch) {
        currentChildMatch.update(nextElementChild)
      } else {
        const currentComponentChild = currentComponentChildren[i]

        if (currentComponentChild) {
          const nextElementChildMatch = nextElementChildren
            .slice(i)
            .find(child =>
              areElementsEqual(child, currentComponentChild.element))

          if (nextElementChildMatch) {
            enqueueInsertBefore(
              queue,
              currentComponent,
              i,
              nextElementChildMatch
            )
          } else {
            currentComponentChild.update(nextElementChild)
          }
        } else {
          queue.addTask(() => {
            return currentComponent.appendChild(createComponent(nextElementChild))
          })
        }
      }
    }
  }

  if (currentComponentChildren) {
    currentComponentChildren.slice(i).forEach(child => {
      queue.addTask(() => currentComponent.removeChild(child))
    })
  }

  return queue
}
