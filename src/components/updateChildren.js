/* eslint-disable no-loop-func */
/* eslint-disable max-depth */
import { isSameElement } from '../AmbitiousElement'
import { createComponent } from '../AmbitiousComponent'
import queue from '../utils/Queue'
import reconciler from '../reconciler'

// eslint-disable-next-line max-lines-per-function, max-statements
export const updateChildren = (currentComponent, nextElement) => {
  if (nextElement == null) {
    return queue.pool(() =>
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
      const currentChild = currentComponentChildren[i]

      if (currentChild) {
        queue.pool(() => currentComponent.removeChild(currentChild))
      }
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
          isSameElement(currentChild.element, nextElementChild, {
            ignoreOrder: true
          })
        ) {
          queue.pool(() => currentChild.update(nextElementChild))
        } else {
          const nextElementChildMatch = nextElementChildren
            .slice(i)
            .findIndex(child =>
              isSameElement(child, currentChild.element, {
                ignoreOrder: true
              }))

          if (nextElementChildMatch !== -1) {
            queue.pool(() => {
              currentComponent.insertBefore(
                createComponent(nextElementChild),
                nextElementChildMatch - 1
              )
            })
          } else {
            queue.pool(() => currentChild.update(nextElementChild))
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
