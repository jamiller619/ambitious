import ambitious, { Fragment } from '../src'
import { attach, wait, awaitUpdate } from './utils'

test('simple update', () => {
  expect.assertions(1)

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

  return attach(<App />).then(({ html, dom }) => {
    dom.click()
    return awaitUpdate(() => expect(html).toEqual('<div>1</div>'))
  })
})

test('keyed update and rearrange', () => {
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

  return attach(<App />).then(({ html, dom }) => {
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

test('update with new child', () => {
  const Counter = ({ count }) => {
    return count % 2 == 0 ? <span>{count}</span> : <div>{count}</div>
  }

  const App = (_, { count, setState }) => {
    const handleClick = () => {
      clickCounter += 1
      console.log(`counter is ${clickCounter}`)
      setState({
        count: count + 1
      })
    }
    return (
      <div onClick={handleClick}>
        <Counter count={count} />
      </div>
    )
  }

  App.defaultState = {
    count: 0
  }

  return attach(<App />).then(({ html, dom }) => {
    dom.click()

    return awaitUpdate(() =>
      expect(html).toEqual('<div><span>1</span></div>')
    ).then(() => {
      dom.click()
      return awaitUpdate(() => expect(html).toEqual('<div><div>3</div></div>'))
    })
  })
})
