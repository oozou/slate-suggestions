import React from 'react'
import Portal from './suggestion-portal'
import {
  UP_ARROW_KEY,
  DOWN_ARROW_KEY,
  ENTER_KEY
} from './constants'

function matchTrigger(state, trigger) {
  const currentNode = state.blocks.first()

  return state.isFocused && trigger.test(currentNode.text)
}

function SuggestionsPlugin(opts) {
  const trigger = opts.trigger
  const suggestions = opts.suggestions
  const onEnter = opts.onEnter
  const callback = {}

  function onKeyDown(e, data, state, editor) {
    const keyCode = e.keyCode

    // Prevent default up and down arrow key press when portal is open
    if (matchTrigger(state, trigger) && (keyCode === UP_ARROW_KEY || keyCode === DOWN_ARROW_KEY)) {
      e.preventDefault()
      if (callback.onKeyDown) {
        callback.onKeyDown(keyCode)
      }
    }

    // Prevent default return/enter key press when portal is open
    if (matchTrigger(state, trigger) && keyCode === ENTER_KEY) {
      e.preventDefault()

      // Close portal
      if (callback.closePortal) {
        callback.closePortal()
      }

      // Handle enter
      if (callback.onEnter) {
        return callback.onEnter(callback.suggestion)
      }
    }
  }

  return {
    onKeyDown,
    SuggestionPortal: (props) =>
      <Portal
        {...props}
        trigger={trigger}
        suggestions={suggestions}
        callback={callback}
        onEnter={onEnter}
      />
  }
}

export default SuggestionsPlugin
