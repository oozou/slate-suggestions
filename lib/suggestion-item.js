import React from 'react'

class SuggestionItem extends React.Component {

  onClick = (e) => {
    this.props.closePortal()

    const { editor, suggestion, appendSuggestion } = this.props

    const state = appendSuggestion(suggestion)

    editor.onChange(state)
  }

  onMouseEnter = () =>
    this.props.setSelectedIndex(this.props.index)

  render = () =>
    <li
      className={this.props.index === this.props.selectedIndex ? 'selected' : undefined}
      onClick={this.onClick}
      onMouseEnter={this.onMouseEnter}
    >
      {this.props.suggestion.suggestion}
    </li>
}

export default SuggestionItem
