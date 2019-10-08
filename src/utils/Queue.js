/**
 * batching Queue for DOM manipulations
 * @returns {Queue} an instance of Queue
 */
function Queue () {
  this.tasks = []
  this.scheduled = false
}

Queue.prototype = {
  constructor: Queue,

  task (task) {
    this.tasks.push(task)

    return this.flush()
  },

  pool (task) {
    this.tasks.push(task)

    return this
  },

  flush () {
    return new Promise(resolve => {
      const resolveQueue = callback => {
        this.scheduled = false

        return callback()
      }

      if (this.scheduled === false) {
        this.scheduled = true

        return window.requestAnimationFrame(() => {
          while (this.tasks.length) {
            this.tasks.shift()()
          }

          return resolveQueue(resolve)
        })
      }

      return resolveQueue(resolve)
    })
  }
}

export default new Queue()
