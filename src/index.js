import React from 'react'
import Portal from './suggestion-portal'
 
function SuggestionsPlugin(opts) {
   
  const callback = {}

  function onKeyDown(e, change, editor) {
    callback.editor = editor

    if (callback.onKeyDown) {
       return callback.onKeyDown(e, change)
    }
  }
  
  function onKeyUp(e, change, editor) {
    callback.editor = editor

    if (callback.onKeyUp) {
       return callback.onKeyUp(e, change)
    }
  }

  return {
    onKeyDown,
    onKeyUp,
    SuggestionPortal: (props) =>
      <Portal
        {...props}
        {...opts}
        callback={callback}
      />
  }
}

export default SuggestionsPlugin
