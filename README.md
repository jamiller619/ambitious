# Ambitious

> For ambitious user interface development.

## Features

- **100% Functional Components**
- **Local Component State**
- **Side effects API similar to React**
- **Fragments**
- **Standard Attributes Names**
  - Use `class` and `onclick`, or `className` and `onClick` &ndash; The choice is yours!
- **JSX support**
- **Tiny: Currently ~4 KB Gzipped** (and getting smaller)

## Example

```javascript
import ambitious, { render } from 'ambitious'

const Counter = ({ initial }, { count, setState }) => {
  return (
    <div>
      <h1>Counter: {count}</h1>
      <button
        type="button"
        onClick={() => {
          setState({
            count: count + 1
          })
        }}
      >
        Add to Counter
      </button>
    </div>
  )
}

const App = () => {
  return <Counter initial={0} />
}

render(<App />, document.body)
```
