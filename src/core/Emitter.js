// eslint-disable-next-line require-jsdoc
function Emitter () {
  // Keep this empty so it's easier to inherit from
  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
}

Emitter.prototype = {
  on (name, callback, ctx) {
    this.events = this.events || {}

    if (!this.events[name]) this.events[name] = []

    this.events[name].push({
      fn: callback,
      ctx
    })

    return this
  },

  once (name, callback, ctx) {
    // eslint-disable-next-line consistent-this
    const self = this

    // eslint-disable-next-line require-jsdoc
    function listener () {
      self.off(name, listener)
      callback.apply(ctx, arguments)
    }

    listener._ = callback

    return this.on(name, listener, ctx)
  },

  emit (name) {
    const data = [].slice.call(arguments, 1)

    const evtArr = ((this.events || (this.events = {}))[name] || []).slice()

    let i = 0

    const len = evtArr.length

    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data)
    }

    return this
  },

  off (name, callback) {
    const e = this.events || (this.events = {})

    const evts = e[name]

    const liveEvents = []

    if (evts && callback) {
      for (let i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback) liveEvents.push(evts[i])
      }
    }

    // Remove event from queue to prevent memory leak
    // Suggested by https://github.com/lazd
    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

    // eslint-disable-next-line no-unused-expressions
    liveEvents.length ? e[name] = liveEvents : delete e[name]

    return this
  }
}

export default Emitter
