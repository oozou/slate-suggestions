import React from 'react'
import ReactDOM from 'react-dom'
import { Value } from 'slate'
import { Editor } from 'slate-react';

import SuggestionsPlugin from '../lib'
import initialState from './state.json'

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
    value: '@Jon Snow',
    suggestion: '@Jon Snow' // Can be either string or react component
  },
  {
    key: 'John Evans',
    value: '@John Evans',
    suggestion: '@John Evans'
  },
  {
    key: 'Daenerys Targaryen',
    value: '@Daenerys Targaryen',
    suggestion: '@Daenerys Targaryen'
  },
  {
    key: 'Cersei Lannister',
    value: '@Cersei Lannister',
    suggestion: '@Cersei Lannister'
  },
  {
    key: 'Tyrion Lannister',
    value: '@Tyrion Lannister',
    suggestion: '@Tyrion Lannister'
  },
]

class Example extends React.Component {

  constructor() {
    super()

    this.suggestionsPlugin = SuggestionsPlugin({
      trigger: '@',
      capture: /@([\w]*)/,
      suggestions,
      onEnter: (suggestion, change) => {
        const { anchorText, anchorOffset } = this.state.value

        const text = anchorText.text

        let index = { start: anchorOffset - 1, end: anchorOffset }

        if (text[anchorOffset - 1] !== '@') {
          index = getCurrentWord(text, anchorOffset - 1, anchorOffset - 1)
        }

        const newText = `${text.substring(0, index.start)}${suggestion.value} `

        change
          .deleteBackward(anchorOffset)
          .insertText(newText)
        
        return true;
      }
    })

    this.plugins = [
      this.suggestionsPlugin
    ]

    this.state = {
      value: Value.fromJSON(initialState)
    };
  }

  onChange = ({ value }) => {
    this.setState({ value })
  }

  render() {
    const { SuggestionPortal } = this.suggestionsPlugin
    return (
      <div>
        <Editor
          onChange={this.onChange}
          plugins={this.plugins}
          value={this.state.value}
        />
        <SuggestionPortal
          value={this.state.value}
        />
      </div>
    )
  }
}

const example = <Example />
const root = document.body.querySelector('main')
ReactDOM.render(example, root)

module.hot.accept()
