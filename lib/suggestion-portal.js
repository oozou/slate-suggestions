import React from 'react'
import Portal from 'react-portal'
import position from 'selection-position'
import {
  UP_ARROW_KEY,
  DOWN_ARROW_KEY,
  ENTER_KEY
} from './constants'

class SuggestionPortal extends React.Component {

  state = {}

  componentDidMount = () => {
    this.adjustPosition()
  }

  componentDidUpdate = () => {
    this.adjustPosition()
  }

  constructor(props) {
    super()
    props.callback.onKeyDown = this.onKeyDown
    props.callback.onEnter = props.onEnter
    props.callback.closePortal = this.closePortal

    this.selectedIndex = 0
    props.callback.suggestion = props.suggestions[this.selectedIndex]
  }

  onOpen = (portal) => {
    this.setState({ menu: portal.firstChild })
  }

  onKeyDown = (keyCode) => {
    const { suggestions } = this.props
    if (keyCode === DOWN_ARROW_KEY) {
      if (this.selectedIndex + 1 === suggestions.length)
        this.selectedIndex = -1
      this.selectedIndex += 1
    } else if (keyCode === UP_ARROW_KEY) {
      if (this.selectedIndex === 0)
        this.selectedIndex = suggestions.length
      this.selectedIndex -= 1
    }
    this.props.callback.suggestion = this.props.suggestions[this.selectedIndex]
    this.forceUpdate()
  }

  matchTrigger = () => {
    const { state, trigger } = this.props

    const currentNode = state.blocks.first()

    return state.isFocused && trigger.test(currentNode.text)
  }

  getMatchText(text, trigger) {
    const matchArr = text.match(trigger)

    if (matchArr) {
      return matchArr[1].toLowerCase()
    }

    return undefined
  }

  filteredSuggestions = () => {
    const { suggestions, state, trigger } = this.props

    const text = this.getMatchText(state.blocks.first().text, trigger)

    return suggestions.filter(suggestion => suggestion.suggestion.toLowerCase().indexOf(text) != -1)
  }

  adjustPosition = () => {
    const { menu } = this.state
    if (!menu) return

    if (!this.matchTrigger()) {
      menu.removeAttribute('style')
      return
    }

    if (menu.style.display !== 'block') {
      const rect = position()
      menu.style.display = 'block'
      menu.style.opacity = 1
      menu.style.top = `${rect.top + window.scrollY}px` // eslint-disable-line no-mixed-operators
      menu.style.left = `${rect.left + window.scrollX}px` // eslint-disable-line no-mixed-operators
    }
  }

  closePortal = () => {
    const { menu } = this.state
    if (!menu) return

    if (!this.matchTrigger()) {
      menu.removeAttribute('style')
      return
    }
  }

  render = () => {
    const suggestions = this.filteredSuggestions()

    return (
      <Portal isOpened onOpen={this.onOpen}>
        <div className="suggestion-portal">
          <ul>
            {suggestions.map((suggestion, index) =>
              <li className={index === this.selectedIndex ? 'selected' : undefined} key={suggestion.key}>{suggestion.suggestion}</li>
            )}
          </ul>
        </div>
      </Portal>
    )
  }
}

export default SuggestionPortal
