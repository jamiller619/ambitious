const isEmpty = queue => queue.items.length <= 0

export default function Queue() {
  this.items = []
}

Queue.prototype = {
  enqueue(...items) {
    this.items.push(...items)
  },

  dequeue() {
    if (isEmpty(this) === false) {
      return this.items.shift()
    }
  },

  async flush() {
    return new Promise(resolve => {
      // window.requestAnimationFrame(async () => {
      let item = null

      while ((item = this.dequeue())) {
        item.action ? item.action() : item()
      }

      resolve()
      // })
    })
  }
}
