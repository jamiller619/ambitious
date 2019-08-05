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
      window.requestAnimationFrame(async () => {
        await Promise.all(this.tasks.map(task => task && typeof task === 'function' && task()))

        resolve()
      })
    })
  }
}
