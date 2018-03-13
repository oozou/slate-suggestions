import React from 'react'
import { Portal } from 'react-portal'
import position from './caret-position'
import SuggestionItem from './suggestion-item'
import getCurrentWord from './current-word'
import {
  UP_ARROW_KEY,
  DOWN_ARROW_KEY,
  ENTER_KEY,
  RESULT_SIZE,
} from './constants'

class SuggestionPortal extends React.Component {

  state = {
    filteredSuggestions: []
  }

  componentDidMount = () => {
    this.isOpen = true
    this.adjustPosition()
  }

  componentDidUpdate = () => {
    this.isOpen = true
    this.adjustPosition()
  }

  constructor(props) {
    super()
    props.callback.onKeyDown = this.onKeyDown
    props.callback.onEnter = props.onEnter
    props.callback.closePortal = this.closePortal
    props.callback.readOnly = false

    this.isOpen = false
    this.selectedIndex = 0
    if (typeof props.suggestions === 'function') {
      props.callback.suggestion = undefined
    } else {
      this.state.filteredSuggestions = props.suggestions.slice(0, props.resultSize ? props.resultSize : RESULT_SIZE)
      props.callback.suggestion = this.state.filteredSuggestions[this.selectedIndex]
    }
  }

  setCallbackSuggestion = () => {
    if (this.state.filteredSuggestions.length) {
      this.props.callback.suggestion = this.state.filteredSuggestions[this.selectedIndex]
    } else {
      this.props.callback.suggestion = undefined
    }
  }

  setFilteredSuggestions = (filteredSuggestions) => {
    this.setState({
      filteredSuggestions
    })
    this.setCallbackSuggestion()
  }

  onKeyDown = (keyCode) => {
    const { filteredSuggestions } = this.state

    if (keyCode === DOWN_ARROW_KEY) {
      if (this.selectedIndex + 1 === filteredSuggestions.length) {
        this.selectedIndex = -1
      }
      this.selectedIndex += 1
      this.setCallbackSuggestion()
      this.forceUpdate()
    } else if (keyCode === UP_ARROW_KEY) {
      if (this.selectedIndex === 0) {
        this.selectedIndex = filteredSuggestions.length
      }
      this.selectedIndex -= 1
      this.setCallbackSuggestion()
      this.forceUpdate()
    } else {
      this.selectedIndex = 0
      const newFilteredSuggestions = this.getFilteredSuggestions()
      if (typeof newFilteredSuggestions.then === 'function') {
        newFilteredSuggestions.then(newFilteredSuggestions => {
          this.setFilteredSuggestions(newFilteredSuggestions)
        }).catch(() => {
          this.setFilteredSuggestions([])
        })
      } else {
        this.setFilteredSuggestions(newFilteredSuggestions)
      }
    }
  }

  matchTrigger = () => {
    const { value, trigger, startOfParagraph } = this.props

    const stateCondition = value.isFocused && !value.isExpanded

    if (!value.selection.anchorKey) return false

    const { anchorText, anchorOffset } = value

    if (startOfParagraph) {
      return stateCondition && anchorText.text === trigger
    }

    const lastChar = anchorText.text[anchorOffset - 1]

    return stateCondition && lastChar && lastChar === trigger
  }

  matchCapture = () => {
    const { value, capture } = this.props

    if (!value.selection.anchorKey) return ''

    const { anchorText, anchorOffset } = value

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

  getFilteredSuggestions = () => {
    const { suggestions, value, capture, resultSize } = this.props

    if (!value.selection.anchorKey) return []

    const { anchorText, anchorOffset } = value

    const currentWord = getCurrentWord(anchorText.text, anchorOffset - 1, anchorOffset - 1)

    const text = this.getMatchText(currentWord, capture)

    if (typeof suggestions === 'function') {
      return suggestions(text)
    } else {
      return suggestions
        .filter(suggestion => suggestion.key.toLowerCase().indexOf(text) != -1)
        .slice(0, resultSize ? resultSize : RESULT_SIZE)
    }
  }

  adjustPosition = () => {
    const { menu } = this
    if (!menu) return

    const match = this.matchCapture()
    if (match === undefined) {
      menu.removeAttribute('style')
      return
    }

    if (this.matchTrigger() || match) {
      const rect = position()
      menu.style.display = 'block'
      menu.style.opacity = 1
      menu.style.top = `${rect.top + window.scrollY}px` // eslint-disable-line no-mixed-operators
      menu.style.left = `${rect.left + window.scrollX}px` // eslint-disable-line no-mixed-operators
    }
  }

  closePortal = () => {
    const { menu } = this
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

  setMenuRef = (menu) => {
    this.menu = menu
  }

  render() {
    const { filteredSuggestions } = this.state
    const isOpen = this.isOpen
    if (!isOpen) {
      return null
    }

    return (
      <Portal>
        <div className="suggestion-portal" ref={this.setMenuRef}>
          <ul>
            {filteredSuggestions.map((suggestion, index) =>
              <SuggestionItem
                key={suggestion.key}
                index={index}
                suggestion={suggestion}
                selectedIndex={this.selectedIndex}
                setSelectedIndex={this.setSelectedIndex}
                appendSuggestion={this.props.callback.onEnter}
                closePortal={this.closePortal}
                editor={this.props.callback.editor}
              />
            )}
          </ul>
        </div>
      </Portal>
    )
  }
}

export default SuggestionPortal
