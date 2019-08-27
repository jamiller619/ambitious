/**
 * batching Queue for DOM manipulations
 * @returns {Queue} an instance of Queue
 */
export default function Queue () {
  this.tasks = []
}

Queue.prototype = {
  addTask (...task) {
    this.tasks = [...this.tasks, ...task]

    return this
  },
  flush () {
    if (this.tasks.length === 0) {
      return Promise.resolve()
    }

    return Promise.all(this.tasks.map(task => task()))
  }
}
