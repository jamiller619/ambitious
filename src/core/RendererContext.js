const CurrentRenderContext = Object.seal({
  current: null
})

const releaseCurrentContext = () => {
  CurrentRenderContext.current = null
}

export const getCurrentContext = () => CurrentRenderContext.current

export const setCurrentContext = (context, callback) => {
  CurrentRenderContext.current = context

  if (callback) {
    // eslint-disable-next-line callback-return
    const result = callback()

    releaseCurrentContext()

    return result
  }

  return releaseCurrentContext
}
