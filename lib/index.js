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
  const capture = opts.capture
  const callback = {}

  function onKeyDown(e, change, editor) {
    const state = change.value
    const keyCode = e.keyCode
    callback.editor = editor

    if (matchTrigger(state, capture)) {
      // Prevent default up and down arrow key press when portal is open
      if ((keyCode === UP_ARROW_KEY || keyCode === DOWN_ARROW_KEY)) {
        e.preventDefault()
      }

      // Prevent default return/enter key press when portal is open
      if (keyCode === ENTER_KEY) {
        e.preventDefault()

        // Close portal
        if (callback.closePortal) {
          callback.closePortal(state, editor)
        }

        // Handle enter
        if (callback.onEnter && callback.suggestion !== undefined) {
          return callback.onEnter(callback.suggestion, change, editor)
        }
      } else {
        if (callback.onKeyDown) {
          return callback.onKeyDown(keyCode, change, editor)
        }
      }
    }
  }

  function SuggestionPortal(props) {
    return (
      <Portal
        {...props}
        {...opts}
        callback={callback}
      />
    )
  }

  return {
    onKeyDown,
    SuggestionPortal
  }
}

export default SuggestionsPlugin
