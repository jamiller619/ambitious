/* eslint-disable no-loop-func */
/* eslint-disable max-depth */
import { areElementsEqual } from '../AmbitiousElement'
import { createComponent } from '../AmbitiousComponent'
import Queue from '../utils/Queue'
import reconciler from '../reconciler'

// eslint-disable-next-line max-lines-per-function, max-statements
export const updateChildren = (currentComponent, nextElement) => {
  let i = 0
  const queue = new Queue()
  const currentComponentChildren = currentComponent.getChildren()

  if (nextElement == null) {
    queue.addTask(() => currentComponent.parent.removeChild(currentComponent))

    return queue
  }

  const nextElementChildren = nextElement.props.children

  const l = Math.max(
    currentComponentChildren.length,
    nextElementChildren.length
  )

  for (; i < l; i += 1) {
    const nextElementChild = nextElementChildren[i]

    if (!nextElementChild) {
      queue.addTask(() =>
        currentComponent.removeChild(currentComponentChildren[i]))

      return queue
    }

    const currentChild = nextElementChild.key
      ? currentComponentChildren.find(child => child.element.key === nextElementChild.key)
      : currentComponentChildren[i]

    // const currentChild = currentComponentChildren[i]

    if (currentChild) {
      if (
        typeof nextElementChild !== 'object' ||
        typeof currentChild !== 'object'
      ) {
        if (typeof currentChild.element !== 'object') {
          if (currentChild.element !== nextElementChild) {
            queue.addTask(() =>
              reconciler.updateTextNode(currentChild, nextElementChild))
          }
        } else {
          queue.addTask(() =>
            currentComponent.replaceChild(
              createComponent(nextElementChild),
              currentChild
            ))
        }
      } else {
        const nextElementChildMatch = nextElementChildren.slice(i).find(child =>
          areElementsEqual(child, currentChild.element, {
            ignoreOrder: true
          }))

        if (nextElementChildMatch) {
          queue.addTask(() =>
            currentComponent.insertBefore(
              createComponent(nextElementChildMatch),
              i - 1
            ))
        } else {
          currentChild.update(nextElementChild)
        }
      }
    } else {
      queue.addTask(() =>
        currentComponent.appendChild(createComponent(nextElementChild)))
    }
  }

  queue.addTask(() =>
    Promise.all(currentComponent
        .getChildren()
        .slice(i)
        .map(child => currentComponent.removeChild(child))))

  return queue
}
