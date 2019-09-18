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

export const attach = Component => {
  const container = document.createElement('main')
  const { body } = document
  body.innerHTML = ''
  body.appendChild(container)

  render(Component, container)

  return new Promise(resolve => {
    setTimeout(() => {
      const dom = document.body.firstChild
      resolve(dom.innerHTML.toString(), dom, Component)
    }, 50)
  })
}
