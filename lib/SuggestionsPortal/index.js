import React from 'react'
import Portal from 'react-portal'
import position from 'selection-position'

/**
 * The suggestions portal
 *
 * @type {Component}
 */

class SuggestionsPortal extends React.Component {

  /**
   * On update, update the suggestion.
   */

  componentDidMount = () => {
    this.updateSuggestion()
  }

  componentDidUpdate = () => {
    this.updateSuggestion()
  }

  /**
   * Render the suggestion component.
   *
   * @return {Element}
   */

  render = () => {
    const { state } = this.state
    const isOpen = state.isExpanded && state.isFocused
    return (
      <Portal isOpened onOpen={this.onOpen}>
        <div className="menu suggestion">
          <h2>Suggestion!</h2>
        </div>
      </Portal>
    )
  }

  /**
   * Update the suggestion's absolute position.
   */

  updateSuggestion = () => {
    const { suggestion, state } = this.state
    if (!suggestion) return

    if (state.isBlurred || state.isCollapsed) {
      suggestion.removeAttribute('style')
      return
    }

    const rect = position()
    suggestion.style.opacity = 1
    suggestion.style.top = `${rect.top + window.scrollY - suggestion.offsetHeight}px`
    suggestion.style.left = `${rect.left + window.scrollX - suggestion.offsetWidth / 2 + rect.width / 2}px`
  }

}

/**
 * Export.
 */

export default SuggestionsPortal
