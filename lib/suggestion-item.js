import React from 'react'

class SuggestionItem extends React.Component {

  onMouseEnter = () =>
    this.props.setSelectedIndex(this.props.index)

  render = () =>
    <li
      className={this.props.index === this.props.selectedIndex ? 'selected' : undefined}
      onMouseEnter={this.onMouseEnter}
    >
      {this.props.suggestion}
    </li>
}

export default SuggestionItem
