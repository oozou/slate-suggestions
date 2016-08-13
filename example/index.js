
import createSuggestionsPlugin from '..'
import React from 'react'
import ReactDOM from 'react-dom'
import initialState from './state.json'
import { Editor, Raw } from 'slate'

const suggestionsPlugin = createSuggestionsPlugin({
  trigger: ')'
});
const { Suggestions } = suggestionsPlugin;
const plugins = [suggestionsPlugin];

class Example extends React.Component {

  // plugins = [
  //   Suggestions({
  //     trigger: ')',
  //     before: /(\(c)$/i,
  //     transform: transform => transform.insertText('©')
  //   })
  // ];

  state = {
    state: Raw.deserialize(initialState, { terse: true })
  };

  onChange = (state) => {
    this.setState({ state })
  }

  onSearchChange = ({ value }) => {
    this.setState({
      suggestions: defaultSuggestionsFilter(value, mentions),
    })
  }

  render = () => {
    return (
      <div>
        <Editor
          onChange={this.onChange}
          plugins={this.plugins}
          state={this.state.state}
        />
        <SuggestionsPortal/>
      </div>
    )
  }

}

const example = <Example />
const root = document.body.querySelector('main')
ReactDOM.render(example, root)
