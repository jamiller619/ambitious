import { createElement } from './core/AmbitiousElement'
import render from './core/render'
import { COMPONENT_TYPE } from './core/components/types'
import { useEffect, useState } from './hooks'

const Fragment = COMPONENT_TYPE.FRAGMENT_COMPONENT

const ambitious = {
  createElement,
  render,
  Fragment
}

export { ambitious as default, render, Fragment, useEffect, useState }
