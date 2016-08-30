
<h3 align="center"><code>slate-suggestions</code></h3>

A [**Slate**](https://github.com/ianstormtaylor/slate) plugin to suggestion replacements or actions based on input. Useful for implementing "mention" or other suggestion based behaviors.

---

### Install

```
npm install --save slate-suggestions
```

_You will need to have installed `slate` as a dependency already._

---

### Usage

```js
import SuggestionsPlugin from 'slate-suggestions'
import { Editor } from 'slate'

const suggestions = [ 
  {
    key: 'jon-snow',
    value: '@Jon Snow',
    suggestion: '@Jon Snow'
  },
  // Some other suggestions
]

const suggestionsPlugin = SuggestionsPlugin({
  trigger: '@',
  capture: /@([\w]*)/,
  suggestions,
  onEnter: (suggestion) => {
    // Modify your state up to your use-cases
    return modifiedState
  }
})

const { SuggestionPortal } = suggestionPlugin

// Add the plugin to your set of plugins...
const plugins = [
  suggestionPlugin
]

// And later pass it into the Slate editor...
<Editor
  ...
  plugins={plugins}
/>
<SuggestionPortal
  state={this.state.state}
/>
```

Option | Type | Description
--- | --- | ---
**`trigger`** | `String` | The trigger to match the inputed character, use to open the portal.
**`capture`** | `RegExp` | An optional regexp that must match the text after the trigger to keep the portal open and extract the text to filter suggestions.
**`suggestions`** | `Array` | An array of suggestions object which have the following keys `key`, `value` and `suggestions`.
**`onEnter`** | `Function` | A function use to handle return/enter keypress to append suggestion into editor. 

---

### Development

Clone the repository and then run:

```
npm install
npm run watch
```

And open the example page in your browser:

```
http://localhost:8888/
```

---

### License

Copyright &copy; 2016, [Oozou](http://oozou.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
