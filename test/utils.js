import { render } from '../src'

export const wait = time => {
  return new Promise(resolve => {
    const timer = setTimeout(() => {
      clearTimeout(timer)
      resolve()
    }, time)
  })
}

export const awaitUpdate = callback => wait(20).then(callback)

export const attach = (Component, callback) => {
  document.body.innerHTML = ''
  const container = document.createElement('main')
  document.body.appendChild(container)
  render(Component, container)
  return new Promise(resolve => {
    setTimeout(() => {
      const dom = document.body.firstChild
      resolve(callback(dom.innerHTML.toString(), dom, Component))
    }, 50)
  })
}
