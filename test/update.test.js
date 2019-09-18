import ambitious, { Fragment } from '../src'
import { attach, wait, awaitUpdate } from './utils'

test('keyed update', () => {
  const App = (_, { data, setState }) => {
    const handleClick = () => {
      setState({
        data: [...data].reverse()
      })
    }

    return (
      <ul onClick={handleClick}>
        {data.map(item => (
          <li key={item.id}>{item.text}</li>
        ))}
      </ul>
    )
  }

  App.defaultState = {
    data: [
      {
        id: 1,
        text: 'One'
      },
      {
        id: 2,
        text: 'Two'
      },
      {
        id: 3,
        text: 'Three'
      }
    ]
  }

  return attach(<App />, (html, dom) => {
    const firstChild = dom.firstChild
    const secondChild = dom.children[1]
    const lastChild = dom.lastChild

    dom.click()
    awaitUpdate(() => {
      expect(firstChild).toBe(dom.lastChild)
      expect(secondChild).toBe(dom.children[1])
      expect(lastChild).toBe(dom.firstChild)
    })
  })
})

test('simple update', () => {
  const App = (_, { count, setState }) => {
    const handleClick = () => {
      setState({
        count: count + 1
      })
    }

    return <div onClick={handleClick}>{count}</div>
  }

  App.defaultState = {
    count: 0
  }

  return attach(<App />, (html, dom) => {
    dom.click()
    awaitUpdate(() => expect(html).toEqual('<div>1</div>'))
  })
})
