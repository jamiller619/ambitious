export const COMPONENT_TYPE = {
  HOST_COMPONENT: Symbol(0),
  COMPOUND_COMPONENT: Symbol(1),
  TEXT_COMPONENT: Symbol(2),
  FRAGMENT_COMPONENT: Symbol(3)
}

export const EVENT_TYPE = {
  BEFORE_DETACH: 'beforedetach',
  DETACH: 'detach',
  BEFORE_ATTACH: 'beforeattach',
  ATTACH: 'attach',
  STATE_UPDATE: 'stateupdate',
  RENDER: 'render',
  RENDER_COMPLETE: 'rendercomplete'
}
