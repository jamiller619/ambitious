import ambitious, { Fragment } from '../src'
import { attach, wait, awaitUpdate } from './utils'

const getAppRootProps = app => {
  return app.children[0].instance.element.props
}

test('text update', done => {
  const App = (props, { count, setState }) => {
    const updateState = () => {
      setState({
        count: count + 1
      }).then(() => {
        expect(document.body.firstChild.innerHTML).toEqual('<div>1</div>')
        done()
      })
    }

    return <div onClick={updateState}>{count}</div>
  }

  App.defaultState = {
    count: 0
  }

  attach(<App />).then(({ component }) => {
    getAppRootProps(component).onClick()
  })
})

test('component update', done => {
  const Counter = ({ count }) => {
    return count % 2 == 0 ? <div>{count}</div> : <span>{count}</span>
  }

  const App = (props, { count, setState }) => {
    const updateState = () => {
      setState({
        count: count + 1
      }).then(() => {
        expect(document.body.firstChild.innerHTML).toEqual(
          '<div><span>1</span></div>'
        )
        done()
      })
    }

    return (
      <div onClick={updateState}>
        <Counter count={count} />
      </div>
    )
  }

  App.defaultState = {
    count: 0
  }

  attach(<App />).then(({ component }) => {
    getAppRootProps(component).onClick()
  })
})

test('rearrange keyed children', done => {
  const App = (props, { data, setState }) => {
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

  attach(<App />).then(({ dom, component }) => {
    const firstChild = dom.firstChild
    const secondChild = dom.children[1]
    const lastChild = dom.lastChild

    getAppRootProps(component).onClick()

    awaitUpdate(() => {
      expect(firstChild).toBe(dom.lastChild)
      expect(secondChild).toBe(dom.children[1])
      expect(lastChild).toBe(dom.firstChild)

      done()
    })
  })
})
