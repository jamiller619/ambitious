/* eslint-disable no-loop-func */
/* eslint-disable max-depth */
import { areElementsEqual } from '../AmbitiousElement'
import { createComponent } from '../AmbitiousComponent'
import queue from '../utils/Queue'
import reconciler from '../reconciler'

// eslint-disable-next-line max-lines-per-function, max-statements
export const updateChildren = (currentComponent, nextElement) => {
  if (nextElement == null) {
    return queue.task(() =>
      currentComponent.parent.removeChild(currentComponent))
  }

  let i = 0
  const currentComponentChildren = currentComponent.getChildren()
  const nextElementChildren = nextElement.props.children
  const l = Math.max(
    currentComponentChildren.length,
    nextElementChildren.length
  )

  for (; i < l; i += 1) {
    const nextElementChild = nextElementChildren[i]

    if (!nextElementChild) {
      queue.pool(() =>
        currentComponent.removeChild(currentComponentChildren[i]))
    } else {
      const currentChild = nextElementChild.key
        ? currentComponentChildren.find(child => child.element.key === nextElementChild.key)
        : currentComponentChildren[i]

      if (currentChild) {
        if (
          typeof nextElementChild !== 'object' ||
          typeof currentChild !== 'object'
        ) {
          if (typeof currentChild.element !== 'object') {
            if (currentChild.element !== nextElementChild) {
              queue.pool(() =>
                reconciler.updateTextNode(currentChild, nextElementChild))
            }
          } else {
            queue.pool(() =>
              currentComponent.replaceChild(
                createComponent(nextElementChild),
                currentChild
              ))
          }
        } else if (
          areElementsEqual(currentChild.element, nextElementChild, {
            ignoreOrder: true
          })
        ) {
          currentChild.update(nextElementChild)
        } else {
          const nextElementChildMatch = nextElementChildren
            .slice(i)
            .find(child =>
              areElementsEqual(child, currentChild.element, {
                ignoreOrder: true
              }))

          if (nextElementChildMatch) {
            queue.pool(() =>
              currentComponent.insertBefore(
                createComponent(nextElementChildMatch),
                i - 1
              ))
          } else {
            currentChild.update(nextElementChild)
          }
        }
      } else {
        queue.pool(() =>
          currentComponent.appendChild(createComponent(nextElementChild)))
      }
    }
  }

  return queue
    .pool(() =>
      currentComponent
        .getChildren()
        .slice(i)
        .map(child => currentComponent.removeChild(child)))
    .flush()
}
