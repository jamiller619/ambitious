const isEmpty = list => list.head === null

const createNode = (data, next) => ({
  data,
  next
})

export default function ChildrenComponent(...components) {
  this.head = null
  this.tail = null

  this.length = 0

  if (components.length > 0) {
    this.push(...components.filter(component => component != null))
  }
}

ChildrenComponent.prototype = {
  *values() {
    let current = this.head

    while (current != null) {
      yield current.data
      current = current.next
    }
  },

  [Symbol.iterator]() {
    return this.values()
  },

  push(...components) {
    components.forEach(component => {
      const node = createNode(component)

      if (isEmpty(this)) {
        this.head = this.tail = node
      } else {
        this.tail.next = node
        this.tail = node
      }

      ++this.length
    })
  },

  get(index) {
    let current = this.head

    if (index > -1) {
      let i = 0

      while (i++ < index && current) {
        current = current.next
      }
    }

    return current ? current.data : null
  },

  map(fn) {
    const list = new ChildrenComponent()

    if (this.length > 0) {
      let current = this._head
      let index = 0

      while (current) {
        list.push(fn(current.data, index, this))
        ++index
        current = current.next
      }
    }

    return list
  },

  findIndex(item) {
    if (isEmpty(this.head)) {
      return false
    } else {
      let current = this.head
      let index = 0
      while (current) {
        if (current.data === item) {
          return index
        }
        ++index
        current = current.next
      }
      return null
    }
  },

  forEach(fn) {
    if (this.length > 0) {
      let current = this.head
      let index = 0

      while (current) {
        fn(current.data, index, this)
        ++index
        current = current.next
      }
    }
  },

  toArray() {
    const array = []
    if (this.length > 0) {
      let current = this.head

      while (current) {
        array.push(current.data)
        current = current.next
      }
    }

    return array
  },

  replace(index, component) {
    let item = null
    if (index > -1) {
      let current = this.head
      let i = 0

      while (i++ < index && current) {
        current = current.next
      }

      item = current ? current.data : null
    }

    if (item == null) {
      throw new Error(
        `Unable to replace the child node at index "${index}" because it doesn't exist.`
      )
    } else {
      item.data = component

      return item.data
    }
  },

  insertAt(index, component) {
    let item = null

    if (index > -1) {
      let prev = this.head
      let current = null

      let i = 0

      while (i++ < index && current) {
        prev = current
        current = current.next
      }

      if (current && current.data) {
        item = createNode(component, current)
        prev.next = item
      }
    }

    return item ? item.data : null
  },

  remove(index) {
    let current = this.head

    if (index > -1) {
      let current = this.head
      let previous
      let i = 0

      if (index === 0) {
        this.head = current.next
      } else {
        // find the right location
        while (i++ < index) {
          previous = current
          current = current.next
        }

        // skip over the item to remove
        previous.next = current.next
      }
    }

    --this.length

    return current ? current.data : null
  }
}
