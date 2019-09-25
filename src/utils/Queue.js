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
      if (!this.scheduled) {
        this.scheduled = true

        const resolveQueue = () => {
          this.scheduled = false

          resolve()
        }

        if (this.tasks.length === 0) {
          resolveQueue()
        } else {
          window.requestAnimationFrame(() => {
            Promise.all(this.tasks.map(task => task())).then(resolveQueue)
          })
        }
      } else {
        resolve()
      }
    })
  }
}

export default new Queue()
