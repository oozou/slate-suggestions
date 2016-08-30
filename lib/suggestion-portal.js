import React from 'react'
import Portal from 'react-portal'
import position from 'selection-position'
import getCurrentWord from './current-word'
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
    const filteredSuggestions = this.filteredSuggestions()

    if (keyCode === DOWN_ARROW_KEY) {
      if (this.selectedIndex + 1 === filteredSuggestions.length)
        this.selectedIndex = -1
      this.selectedIndex += 1
    } else if (keyCode === UP_ARROW_KEY) {
      if (this.selectedIndex === 0)
        this.selectedIndex = filteredSuggestions.length
      this.selectedIndex -= 1
    } else {
      this.selectedIndex = 0
    }

    this.forceUpdate()
  }

  matchTrigger = () => {
    const { state, trigger } = this.props

    const { anchorText, anchorOffset } = state

    const lastChar = anchorText.text[anchorOffset-1]

    return state.isFocused && !state.isExpanded && lastChar && lastChar === trigger
  }

  matchCapture = () => {
    const { state, capture } = this.props

    const { anchorText, anchorOffset } = state

    const currentWord = getCurrentWord(anchorText.text, anchorOffset-1, anchorOffset-1)

    const text = this.getMatchText(currentWord, capture)

    return text
  }

  getMatchText = (text, trigger) => {
    const matchArr = text.match(trigger)

    if (matchArr) {
      return matchArr[1].toLowerCase()
    }

    return undefined
  }

  filteredSuggestions = () => {
    const { suggestions, state, capture } = this.props

    const { anchorText, anchorOffset } = state

    const currentWord = getCurrentWord(anchorText.text, anchorOffset-1, anchorOffset-1)

    const text = this.getMatchText(currentWord, capture)

    return suggestions.filter(suggestion => suggestion.suggestion.toLowerCase().indexOf(text) != -1)
  }

  adjustPosition = () => {
    const { menu } = this.state
    if (!menu) return

    if (this.matchCapture() === undefined) {
      menu.removeAttribute('style')
      return
    }

    if (this.matchTrigger()) {
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
    this.props.callback.suggestion = suggestions[this.selectedIndex]

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
