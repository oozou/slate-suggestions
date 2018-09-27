import React, { Component } from 'react';
import { Value } from 'slate'
import { Editor } from 'slate-react'
import initialState from './state.json'
import './App.css';
import SuggestionsPlugin from "slate-suggestions"

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
    key: '@JonSnow',
    value: 'Jon Snow',
    suggestion: '@JonSnow' // Can be either string or react component
  },
  {
    key: '@DaenerysTargaryen',
    value: 'Daenerys Targaryen',
    suggestion: '@DaenerysTargaryen'
  },
  {
    key: '@CerseiLannister',
    value: 'Cersei Lannister',
    suggestion: '@CerseiLannister'
  },
  {
    key: '@TyrionLannister',
    value: 'Tyrion Lannister',
    suggestion: '@TyrionLannister'
  },
]

class App extends Component {
  constructor(props) {
    super(props)
    this.suggestionsPlugin = new SuggestionsPlugin({
      capture: /(^|\W)@([^\s]+)?/,
      suggestions,
      onEnter: (suggestion, change) => {

        const { anchorText, selection } = change.value
        const { offset } = selection.anchor

        const text = anchorText.text

        let index = { start: offset - 1, end: offset }

        if (text[offset - 1] !== '@') {
          index = getCurrentWord(text, offset - 1, offset - 1)
        }

        const newText = `${text.substring(0, index.start)}${suggestion.value} `

        change
          .deleteBackward(offset)
          .insertText(newText)
          .focus()
          .moveToEndOfText()
         
        return false;
      }
    })

    this.plugins = [
      this.suggestionsPlugin
    ]
  }

  state = {
    value: Value.fromJSON(initialState)
  };

  onChange = ({ value }) => {
    this.setState({ value })
  }

  render() {

    const { SuggestionPortal } = this.suggestionsPlugin
    return (
      <div className="App">
        <Editor
          onChange={this.onChange}
          plugins={this.plugins}
          value={this.state.value}
        />
        <SuggestionPortal
          value={this.state.value}
        />
      </div>
    );
  }
}

export default App;
