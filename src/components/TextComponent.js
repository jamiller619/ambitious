import { COMPONENT_TYPES } from '../utils'

const TextComponent = {
  $$typeof: COMPONENT_TYPES.TEXT,

  construct(text) {
    this.text = text
  },

  update(nextComponent) {
    if (nextComponent.text !== this.text) {
      return {
        type: 'textNodeUpdate',
        action: () =>
          (this.text = this.node.textContent = this.element =
            nextComponent.text)
      }
    }
  },

  render() {
    return (this.node = document.createTextNode(this.text))
  }
}

export default TextComponent
