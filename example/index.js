
import SuggestionsPlugin from '..'
import React from 'react'
import ReactDOM from 'react-dom'
import initialState from './state.json'
import { Editor, Raw } from 'slate'

const suggestions = [
  {
    key: 'table',
    value: 'table',
    suggestion: '/table' // Can be either string or react component
  },
  {
    key: 'image',
    value: 'image',
    suggestion: '/image'
  },
  {
    key: 'ul',
    value: 'ul',
    suggestion: '/list-bullets'
  },
  {
    key: 'ol',
    value: 'ol',
    suggestion: '/list-numbers'
  },
]

class Example extends React.Component {

  constructor() {
    super()

    const suggestionsPlugin = new SuggestionsPlugin({
      trigger: /^\/([^\s]*)$/,
      suggestions,
      onEnter: (suggestion) => {
        const { state } = this.state

        return state
          .transform()
          .insertText(`${suggestion.value} `)
          .apply()
      }
    })

    this.SuggestionPortal = suggestionsPlugin.SuggestionPortal

    this.plugins = [
      suggestionsPlugin
    ];
  }

  state = {
    state: Raw.deserialize(initialState, { terse: true })
  };

  onChange = (state) => {
    this.setState({ state })
  }

  render = () => {
    return (
      <div>
        <Editor
          onChange={this.onChange}
          plugins={this.plugins}
          state={this.state.state}
        />
        <this.SuggestionPortal
          state={this.state.state}
        />
      </div>
    )
  }
}

const example = <Example />
const root = document.body.querySelector('main')
ReactDOM.render(example, root)
