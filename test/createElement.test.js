import ambitious, { render } from '../src'

const attach = (Component, callback) => {
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

test('render a simple component', () => {
  const App = () => {
    return (
      <div id="app" class="style">
        <h1>sup</h1>
      </div>
    )
  }

  return attach(<App />, html => {
    expect(html).toEqual('<div id="app" class="style"><h1>sup</h1></div>')
  })
})

test('render an element', () => {
  const app = (
    <div id="app" class="style">
      <h1>sup</h1>
    </div>
  )

  return attach(app, html => {
    expect(html).toEqual('<div id="app" class="style"><h1>sup</h1></div>')
  })
})

test('skip invalid null and Boolean children', () => {
  const App = ({ children }) => {
    return (
      <div id="app" class="style">
        {children}
      </div>
    )
  }

  return attach(
    <App>
      {null}
      {false}
    </App>,
    html => {
      expect(html).toEqual('<div id="app" class="style"></div>')
    }
  )
})

test('array as class prop', () => {
  const App = () => {
    return (
      <div class={['classOne', 'classTwo']}>
        <h1>sup</h1>
      </div>
    )
  }

  return attach(<App />, html => {
    expect(html).toEqual('<div class="classOne classTwo"><h1>sup</h1></div>')
  })
})

test('apply correct HTML attributes', () => {
  const App = () => {
    return (
      <div data-test="testing" this-should-not-work="true">
        <h1>sup</h1>
      </div>
    )
  }

  return attach(<App />, html => {
    expect(html).toEqual('<div data-test="testing"><h1>sup</h1></div>')
  })
})

test('simple app with props', () => {
  const App = props => {
    return (
      <div {...props}>
        <h1>sup</h1>
      </div>
    )
  }

  return attach(<App id="app" class="style" />, html => {
    expect(html).toEqual('<div id="app" class="style"><h1>sup</h1></div>')
  })
})

test('style object', () => {
  const App = () => {
    return (
      <div
        style={{
          backgroundColor: 'blue',
          height: '25px',
          width: '100px',
          color: 'white'
        }}
      >
        <h1>sup</h1>
      </div>
    )
  }

  return attach(<App />, html => {
    expect(html).toEqual(
      '<div style="background-color: blue; height: 25px; width: 100px; color: white;"><h1>sup</h1></div>'
    )
  })
})

test('simple app with props and children', () => {
  const App = ({ id, children }) => {
    return <div id={id}>{children}</div>
  }

  return attach(
    <App id="app">
      <h1>sup</h1>
    </App>,
    html => {
      expect(html).toEqual('<div id="app"><h1>sup</h1></div>')
    }
  )
})

test('simple SVG app', () => {
  const App = () => {
    return (
      <svg id="svg">
        <circle
          cx="25"
          cy="75"
          r="20"
          stroke="red"
          fill="transparent"
          stroke-width="5"
        />
      </svg>
    )
  }

  return attach(<App id="app" class="style" />, (html, dom) => {
    expect(html).toEqual(
      '<svg id="svg"><circle cx="25" cy="75" r="20" stroke="red" fill="transparent" stroke-width="5"></circle></svg>'
    )
    // The SVG element itself is an HTMLElement, so we get
    // the first child, the "circle" element
    expect(dom.firstChild instanceof SVGElement).toBe(true)
  })
})
