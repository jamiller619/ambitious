import { onNextFrame } from './shared'

const nextFrameCallback = tasks => () => {
  return Promise.all(tasks.map(task => task()))
}

/**
 * batching Queue for DOM manipulations
 * @returns {Queue} an instance of Queue
 */
export default function Queue () {
  this.tasks = []
}

Queue.prototype = {
  addTask (...task) {
    this.tasks.push(...task)

    return this
  },
  flush () {
    return new Promise(resolve => {
      const { tasks } = this

      // eslint-disable-next-line prefer-arrow-callback
      onNextFrame(nextFrameCallback(tasks)).then(resolve)
    })
  }
}
