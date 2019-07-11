import { COMPONENT_TYPES } from '../utils'

const TextComponent = {
  $$typeof: COMPONENT_TYPES.TEXT,

  construct(text) {
    this.text = text
  },

  update(nextElement) {
    if (this.text !== nextElement) {
      this.text = this.node.textContent = this.element = nextElement
    }

    return this
  },

  render() {
    return (this.node = document.createTextNode(this.text))
  }
}

export default TextComponent
