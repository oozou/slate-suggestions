
import SuggestionsPlugin from '..'
import React from 'react'
import ReactDOM from 'react-dom'
import initialState from './state.json'
import { Editor, Raw } from 'slate'

function getCurrentWord(text, index, initialIndex) {
  if (index === initialIndex) {
    return { start: getCurrentWord(text, index - 1, initialIndex), end: getCurrentWord(text, index + 1, initialIndex) }
  }
  if (text[index] === " " || text[index] === "@" || text[index] === undefined) {
    return index
  }
  if (index < initialIndex) {
    return getCurrentWord(text, index - 1, initialIndex)
  }
  if (index > initialIndex) {
    return getCurrentWord(text, index + 1, initialIndex)
  }
}

const suggestions = [
  {
    key: 'Jon Snow',
    value: 'Jon Snow',
    suggestion: '@Jon Snow' // Can be either string or react component
  },
  {
    key: 'Daenerys Targaryen',
    value: 'Daenerys Targaryen',
    suggestion: '@Daenerys Targaryen'
  },
  {
    key: 'Cersei Lannister',
    value: 'Cersei Lannister',
    suggestion: '@Cersei Lannister'
  },
  {
    key: 'Tyrion Lannister',
    value: 'Tyrion Lannister',
    suggestion: '@Tyrion Lannister'
  },
]

class Example extends React.Component {

  constructor() {
    super()

    this.suggestionsPlugin = new SuggestionsPlugin({
      trigger: '@',
      capture: /@([\w]*)/,
      suggestions,
      onEnter: (suggestion) => {
        const { state } = this.state

        return state
          .transform()
          .insertText(suggestion.value)
          .apply()
      }
    })

    this.plugins = [
      this.suggestionsPlugin
    ]
  }

  state = {
    state: Raw.deserialize(initialState, { terse: true })
  };

  onChange = (state) => {
    this.setState({ state })
  }

  render = () => {
    const { SuggestionPortal } = this.suggestionsPlugin
    return (
      <div>
        <Editor
          onChange={this.onChange}
          plugins={this.plugins}
          state={this.state.state}
        />
        <SuggestionPortal
          state={this.state.state}
        />
      </div>
    )
  }
}

const example = <Example />
const root = document.body.querySelector('main')
ReactDOM.render(example, root)
