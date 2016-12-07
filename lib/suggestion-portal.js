import React from 'react'
import Portal from 'react-portal'
import position from 'selection-position'
import SuggestionItem from './suggestion-item'
import getCurrentWord from './current-word'
import {
  UP_ARROW_KEY,
  DOWN_ARROW_KEY,
  ENTER_KEY,
  RESULT_SIZE,
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
      if (this.selectedIndex + 1 === filteredSuggestions.length) {
        this.selectedIndex = -1
      }
      this.selectedIndex += 1
    } else if (keyCode === UP_ARROW_KEY) {
      if (this.selectedIndex === 0) {
        this.selectedIndex = filteredSuggestions.length
      }
      this.selectedIndex -= 1
    } else {
      this.selectedIndex = 0
    }

    this.forceUpdate()
  }

  matchTrigger = () => {
    const { state, trigger, startOfParagraph } = this.props

    const stateCondition = state.isFocused && !state.isExpanded

    if (!state.selection.anchorKey) return false

    const { anchorText, anchorOffset } = state

    if (startOfParagraph) {
      return stateCondition && anchorText.text === trigger
    }

    const lastChar = anchorText.text[anchorOffset - 1]

    return stateCondition && lastChar && lastChar === trigger
  }

  matchCapture = () => {
    const { state, capture } = this.props

    if (!state.selection.anchorKey) return ''

    const { anchorText, anchorOffset } = state

    const currentWord = getCurrentWord(anchorText.text, anchorOffset - 1, anchorOffset - 1)

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
    const { suggestions, state, capture, resultSize } = this.props

    if (!state.selection.anchorKey) return []

    const { anchorText, anchorOffset } = state

    const currentWord = getCurrentWord(anchorText.text, anchorOffset - 1, anchorOffset - 1)

    const text = this.getMatchText(currentWord, capture)

    return suggestions
      .filter(suggestion => suggestion.key.toLowerCase().indexOf(text) != -1)
      .slice(0, resultSize ? resultSize : RESULT_SIZE)
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

  setSelectedIndex = (selectedIndex) => {
    this.selectedIndex = selectedIndex
    this.forceUpdate()
  }

  render = () => {
    const suggestions = this.filteredSuggestions()
    this.props.callback.suggestion = suggestions[this.selectedIndex]

    return (
      <Portal isOpened onOpen={this.onOpen}>
        <div className="suggestion-portal">
          <ul>
            {suggestions.map((suggestion, index) =>
              <SuggestionItem
                key={suggestion.key}
                index={index}
                suggestion={suggestion.suggestion}
                selectedIndex={this.selectedIndex}
                setSelectedIndex={this.setSelectedIndex}
              />
            )}
          </ul>
        </div>
      </Portal>
    )
  }
}

export default SuggestionPortal
