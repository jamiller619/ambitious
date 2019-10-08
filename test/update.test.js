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
        const expectedHTML =
          count % 2 === 0
            ? `<div><div>${count}</div></div>`
            : `<div><span>${count}</span></div>`
        expect(document.body.firstChild.innerHTML).toEqual(expectedHTML)
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
    const rootProps = getAppRootProps(component)

    rootProps.onClick()

    awaitUpdate()
      .then(() => {
        rootProps.onClick()
        return awaitUpdate()
      })
      .then(done)
  })
})

test('rearrange keyed children', done => {
  const App = (props, { data, setState }) => {
    const updateState = () => {
      setState({
        data: [...data].reverse()
      })
    }

    return (
      <ul onClick={updateState}>
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

    awaitUpdate().then(() => {
      expect(firstChild).toBe(dom.lastChild)
      expect(secondChild).toBe(dom.children[1])
      expect(lastChild).toBe(dom.firstChild)

      done()
    })
  })
})

// test('add and remove an un-keyed child from the beginning of a list', done => {
//   const Child = () => {
//     return <div>child one</div>
//   }

//   const App = (props, { showFirstChild, setState }) => {
//     const updateState = () => {
//       setState({
//         showFirstChild: !showFirstChild
//       }).then(() => {
//         expect(document.body.firstChild.innerHTML).toEqual(
//           '<div><div>child two</div></div>'
//         )
//       })
//     }

//     return (
//       <div onClick={updateState}>
//         {showFirstChild && <Child />}
//         <div>child two</div>
//       </div>
//     )
//   }

//   App.defaultState = {
//     showFirstChild: false
//   }

//   attach(<App />).then(({ component }) => {
//     getAppRootProps(component).onClick()

//     awaitUpdate().then(() => {})
//   })
// })
