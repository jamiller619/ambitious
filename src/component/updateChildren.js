/* eslint-disable max-depth */
import { areElementsEqual } from '../utils'
import createComponent from './createComponent'
import Queue from '../queue'

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
  const nextElementChildren = nextElement.props.children

  let i = 0
  const l = nextElementChildren.length

  for (; i < l; i += 1) {
    const nextElementChild = nextElementChildren[i]

    if (typeof nextElementChild !== 'object') {
      const currentChild = currentComponentChildren[i]

      if (typeof currentChild.element !== 'object') {
        if (currentChild.element !== nextElementChild) {
          queue.addTask(() => {
            currentChild.getNode().textContent = currentChild.element = nextElementChild
          })
        }
      } else {
        queue.addTask(async () => {
          await currentComponent.replaceChild(
            createComponent(nextElementChild),
            currentChild
          )
        })
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

  currentComponentChildren.slice(i).forEach(child => {
    queue.addTask(() => currentComponent.removeChild(child))
  })

  return queue
}
