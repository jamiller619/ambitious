/* eslint-disable max-depth */
import { areElementsEqual } from '../AmbitiousElement'
import { createComponent } from '../AmbitiousComponent'
import Queue from '../utils/Queue'
import reconciler from '../reconciler'

// eslint-disable-next-line max-params
const enqueueInsertBefore = (queue, parentComponent, index, nextElement) =>
  queue.addTask(() =>
    parentComponent.insertBefore(createComponent(nextElement), index))

// export const updateChildren = (currentComponent, nextElement) => {
//   const queue = new Queue()
//   const currentChildren = currentComponent.getChildren()
//   const nextChildren = nextElement.props.getChildren

//   let oldStartIdx = 0, newStartIdx = 0;
//   let oldEndIdx = currentChildren.length - 1;
//   let oldStartVnode = currentComponent[0];
//   let oldEndVnode = currentComponent[oldEndIdx];
//   let newEndIdx = nextChildren.length - 1;
//   let newStartVnode = nextChildren[0];
//   let newEndVnode = nextChildren[newEndIdx];
//   let oldKeyToIdx
//   let idxInOld
//   let elmToMove
//   let before

//   while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
//     if (oldStartVnode == null) {
//         oldStartVnode = currentChildren[++oldStartIdx]; // Vnode might have been moved left
//       } else if (oldEndVnode == null) {
//         oldEndVnode = currentChildren[--oldEndIdx];
//       } else if (newStartVnode == null) {
//         newStartVnode = nextChildren[++newStartIdx];
//       } else if (newEndVnode == null) {
//         newEndVnode = nextChildren[--newEndIdx];
//       } else if (areElementsEqual(oldStartVnode, newStartVnode)) {
//         patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
//         oldStartVnode = currentChildren[++oldStartIdx];
//         newStartVnode = nextChildren[++newStartIdx];
//       } else if (areElementsEqual(oldEndVnode, newEndVnode)) {
//         patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
//         oldEndVnode = currentChildren[--oldEndIdx];
//         newEndVnode = nextChildren[--newEndIdx];
//       } else if (areElementsEqual(oldStartVnode, newEndVnode)) { // Vnode moved right
//         patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
//         queue.addTask(() => currentComponent)
//         api.insertBefore(parentElm, oldStartVnode.elm as Node, api.nextSibling(oldEndVnode.elm as Node));
//         oldStartVnode = currentChildren[++oldStartIdx];
//         newEndVnode = nextChildren[--newEndIdx];
//       } else if (areElementsEqual(oldEndVnode, newStartVnode)) { // Vnode moved left
//         patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
//         api.insertBefore(parentElm, oldEndVnode.elm as Node, oldStartVnode.elm as Node);
//         oldEndVnode = currentChildren[--oldEndIdx];
//         newStartVnode = nextChildren[++newStartIdx];
//       } else {
//         if (oldKeyToIdx === undefined) {
//           oldKeyToIdx = createKeyToOldIdx(currentChildren, oldStartIdx, oldEndIdx);
//         }
//         idxInOld = oldKeyToIdx[newStartVnode.key as string];
//         if (isUndef(idxInOld)) { // New element
//           api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm as Node);
//           newStartVnode = nextChildren[++newStartIdx];
//         } else {
//           elmToMove = currentChildren[idxInOld];
//           if (elmToMove.sel !== newStartVnode.sel) {
//             api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm as Node);
//           } else {
//             patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
//             currentChildren[idxInOld] = undefined as any;
//             api.insertBefore(parentElm, (elmToMove.elm as Node), oldStartVnode.elm as Node);
//           }
//           newStartVnode = nextChildren[++newStartIdx];
//         }
//       }
//   }
// }

// eslint-disable-next-line max-lines-per-function, max-statements
export const updateChildren = (currentComponent, nextElement) => {
  const queue = new Queue()
  const currentComponentChildren = currentComponent.getChildren()

  if (nextElement == null) {
    queue.addTask(() => currentComponent.parent.removeChild(currentComponent))

    return queue
  }

  const nextElementChildren = nextElement.props.children

  let i = 0
  const l = nextElementChildren.length

  for (; i < l; i += 1) {
    const nextElementChild = nextElementChildren[i]
    const currentChild =
      currentComponentChildren
        .slice(i + 1)
        .find(child => areElementsEqual(child, nextElementChild)) ||
      currentComponentChildren[i]
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
        const nextElementChildMatch = nextElementChildren.find(child =>
          areElementsEqual(child, currentChild.element, {
            ignoreOrder: true
          }))

        if (nextElementChildMatch) {
          enqueueInsertBefore(queue, currentComponent, i, nextElementChildMatch)
        } else {
          currentChild.update(nextElementChild)
        }
      }
    } else {
      queue.addTask(() =>
        currentComponent.appendChild(createComponent(nextElementChild)))
    }
  }

  if (currentComponentChildren) {
    currentComponentChildren.slice(i).forEach(child => {
      queue.addTask(() => currentComponent.removeChild(child))
    })
  }

  return queue
}

// const morphElements = (currentComponent, nextElement) => {
//   const currentElement = currentComponent.element

//   if (!currentElement) {
//     return nextElement
//   } else if (!nextElement) {
//     return null
//   } else if (currentElement.type !== nextElement.type) {
//     return nextElement
//   }

//   currentComponent.update(nextElement)

//   return currentElement
// }

// eslint-disable-next-line max-lines-per-function, max-statements
// export const updateChildren = (currentComponent, nextElement) => {
//   const queue = new Queue()
//   const currentComponentChildren = currentComponent.getChildren()

//   const nextElementChildren = nextElement.props.children

//   let offset = 0

//   let i = 0

//   const l = Math.max(
//     currentComponentChildren.length,
//     nextElementChildren.length
//   )

//   for (; i < l; i += 1) {
//     const currentChildComponent = currentComponentChildren[i]
//     const nextChildElement = nextElementChildren[i - offset]

//     if (!nextChildElement) {
//       queue.addTask(() => currentComponent.removeChild(currentChildComponent))
//       i--
//     } else if (!currentChildComponent) {
//       queue.addTask(() =>
//         currentComponent.appendChild(createComponent(nextChildElement)))
//       offset++
//     } else if (areElementsEqual(currentComponent.element, nextChildElement)) {
//       const morphed = morphElements(currentChildComponent, nextChildElement)

//       if (morphed !== currentChildComponent.element) {
//         queue.addTask(() =>
//           currentComponent.replaceChild(
//             createComponent(nextChildElement),
//             currentChildComponent
//           ))

//         offset++
//       }
//     } else {
//       const currentChildMatch = currentComponentChildren.slice(i).find(child =>
//         areElementsEqual(child, nextChildElement, {
//           ignoreOrder: true
//         }))

//       if (currentChildMatch) {
//         const morphed = morphElements(currentChildMatch, nextChildElement)

//         if (morphed !== currentChildMatch.element) offset++

//         queue.addTask(() =>
//           currentComponent.insertBefore(
//             createComponent(nextChildElement),
//             currentChildComponent
//           ))
//       } else if (!nextChildElement.key && !currentChildComponent.element.key) {
//         const morphed = morphElements(currentChildComponent, nextChildElement)

//         if (morphed !== currentChildComponent.element) {
//           queue.addTask(() =>
//             currentComponent.replaceChild(
//               createComponent(nextChildElement),
//               currentChildComponent
//             ))
//           offset++
//         }
//       } else {
//         queue.addTask(() =>
//           currentComponent.insertBefore(
//             createComponent(nextChildElement),
//             currentChildComponent
//           ))
//         offset++
//       }
//     }
//   }

//   return queue
// }
