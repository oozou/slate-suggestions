import React from 'react'
import Portal from 'react-portal'
import position from './caret-position'
import SuggestionItem from './suggestion-item'
import getCurrentWord from './current-word'
import {
    UP_ARROW_KEY,
    DOWN_ARROW_KEY,
    RESULT_SIZE,
} from './constants'

class SuggestionPortal extends React.Component {
    // Adjust position on initial mount
    componentDidMount = () => {
        this.adjustPosition()
    }

    // Adjust position on each update
    componentDidUpdate = () => {
        this.adjustPosition()
    }

    constructor(props) {
        super()
        // Set callback values so we can pass functions up
        props.callback.onKeyDown = this.onKeyDown
        props.callback.onEnter = props.onEnter
        props.callback.closePortal = this.closePortal
        props.callback.readOnly = false

        // Storing selected index in state b/c updates should trigger a re-render
        this.state = {
            selectedIndex: 0,
        }

        // Set first suggestion
        if (typeof props.suggestions === 'function') {
            const filteredSuggestions = props.suggestions('');
            props.callback.suggestion = filteredSuggestions[this.state.selectedIndex]
        } else {
            const filteredSuggestions = props.suggestions.slice(0, props.resultSize ? props.resultSize : RESULT_SIZE)
            props.callback.suggestion = filteredSuggestions[this.state.selectedIndex]
        }
    }

    // Given # positions changed, update selectedIndex with new position
    setSelectedIndex = (newIndex) => {
        this.setState({
            selectedIndex: newIndex
        });
    }

    // Use filtered suggestions and index to pass a suggestion up to plugin
    setCallbackSuggestion = (filteredSuggestions, selectedIndex=0) => {
        if (filteredSuggestions.length) {
            this.props.callback.suggestion = filteredSuggestions[selectedIndex]
        } else {
            this.props.callback.suggestion = undefined
        }
    }

    // Given # positions changed, return new index, wrapping if overflow
    getNewMenuPostion = (change) => { 
        const filteredSuggestions  = this.getFilteredSuggestions();
        if(filteredSuggestions.length === 0) { 
            return 0;
        } else { 
            // this will allow wrap around to the end of the list
            const changePlusOriginalLength = change + filteredSuggestions.length;
            const changeAfterWrapping = (this.state.selectedIndex + changePlusOriginalLength) % filteredSuggestions.length;      
            return changeAfterWrapping;
        }
    }

    // Use new key-presses to update the current suggestion
    onKeyDown = (keyCode, data) => {
        if (keyCode === DOWN_ARROW_KEY || keyCode === UP_ARROW_KEY) {
            // If up/down, change position in list
            const filteredSuggestions  = this.getFilteredSuggestions();
            const positionChange = (keyCode === DOWN_ARROW_KEY) ? +1 : -1; 
            const newIndex = this.getNewMenuPostion(positionChange);
            this.setSelectedIndex(newIndex)
            this.setCallbackSuggestion(filteredSuggestions, newIndex);
        } else {
            // Else, determine character and update suggestions accordingly
            const newFilteredSuggestions  = this.getFilteredSuggestions(data);
            this.setSelectedIndex(0)
            if (typeof newFilteredSuggestions.then === 'function') {
                newFilteredSuggestions.then(newFilteredSuggestions => {
                    this.setCallbackSuggestion(newFilteredSuggestions, 0);
                }).catch(() => {
                    this.setCallbackSuggestion([]);
                })
            } else {
                this.setCallbackSuggestion(newFilteredSuggestions, 0);
            }
        }
    }

    // Determines if we've hit a trigger-char
    matchTrigger = () => {
        const { state, trigger, startOfParagraph } = this.props
        // Only match if the state is focuses and not expanded
        const stateCondition = state.isFocused && !state.isExpanded

        // Selection has no anchor, we have no text: ergo no match
        if (!state.selection.anchorKey) return false

        const { anchorText, anchorOffset } = state
        if (startOfParagraph) {
            // Matched if all the text in this block(paragraph) matches the trigger 
            // and if the state condition is good 
            return stateCondition && anchorText.text === trigger
        }

        // Else check f the last char is a match for the trigger
        const lastChar = anchorText.text[anchorOffset - 1]
        return stateCondition && lastChar && lastChar === trigger
    }

    // Get the match text if there is any
    matchCapture = () => {
        const { state, capture, trigger } = this.props

        // Selection has no anchor, we have no text: ergo no match        
        if (!state.selection.anchorKey) return ''

        // Else, compare current word to he 
        const { anchorText, anchorOffset } = state
        const currentWord = getCurrentWord(anchorText.text, anchorOffset - 1, trigger)
        const text = this.getMatchText(currentWord, capture)
        return text
    }

    // Get the match text if there is any
    getMatchText = (text, trigger) => {
        const matchArr = text.match(trigger)
        if (matchArr) {
            return matchArr[1].toLowerCase()
        }
        return undefined
    }

    // Filter suggestions based on incoming data 
    getFilteredSuggestions = (incomingData) => {
        const { suggestions, state, capture, resultSize, trigger } = this.props

        if (!state.selection.anchorKey) return [];

        const { anchorText, anchorOffset } = state;

        let nextChar = "";
        // If there is incoming data from a keydown, include that as next char
        if (incomingData !== undefined) { 
            nextChar = this.convertSlateDataObjectToCharacter(incomingData);
            if (nextChar == null) return [];
        }

        // Put together newText based on nextCharacter; change offset if char is -
        let newText = anchorText.text;
        let offset = anchorOffset;
        if (nextChar === "backspace") { 
            if (newText.length > 0) { 
                // Remove last character if we've backspaced and there is a letter
                newText = newText.slice(0, newText.length - 1);
                offset -= 1;
            }
        } else { 
            // Else, add the processed character
            newText += nextChar;
        }   

        // Get the current word after processing the new data
        const currentWord = getCurrentWord(newText, offset, trigger);
        const text = this.getMatchText(currentWord, capture)

        if (typeof suggestions === 'function') {
            return suggestions(text)
        } else {
            const filtered = suggestions
                .filter(suggestion => suggestion.key.toLowerCase().indexOf(text) !== -1)
                .slice(0, resultSize ? resultSize : RESULT_SIZE);
            return filtered;
        }
    }

    setDefaultSuggestion = () => { 
        const { suggestions, resultSize, trigger } = this.props
        // Set first suggestion
        let filteredSuggestions; 
        if (typeof suggestions === 'function') {
            filteredSuggestions = suggestions('');
        } else {
            filteredSuggestions = suggestions.slice(0, resultSize ? resultSize : RESULT_SIZE)
        }
        this.setCallbackSuggestion(filteredSuggestions, 0);
    }

    // Turn event data into characters to match against
    convertSlateDataObjectToCharacter = (data) => {
        const code = data.code;
        const isShift = data.isShift;
        if (code === 8) return "backspace";
        if (code < 48) return null;
        if (code < 58) { // number keys
            if (isShift) {
                if (code === 48) return ")";
                if (code === 49) return "!";
                if (code === 50) return "@";
                if (code === 51) return "#";
                if (code === 52) return "$";
                if (code === 53) return "%";
                if (code === 54) return "^";
                if (code === 55) return "&";
                if (code === 56) return "*";
                if (code === 57) return "(";
            }
            return String.fromCharCode(code);
        }
        if (code >= 65 && code <= 90) { // A-Z, a-z
            if (isShift) return String.fromCharCode(code);
            return String.fromCharCode(code + 32);
        }
        if (code >= 96 && code <= 105) return String.fromCharCode(code - 48); // numpad 0-9
        if (code === 187 && !isShift) return "=";
        if (code === 188 && !isShift) return ",";
        if (code === 189 && !isShift) return '-';
        if (code === 190 && !isShift) return ".";
        if (code === 191 && !isShift) return "/";
        if (code === 187 && isShift) return "+";
        if (code === 188 && isShift) return "<";
        if (code === 189 && isShift) return '_';
        if (code === 190 && isShift) return ">";
        if (code === 191 && isShift) return "?";
        return null;
    }

    // Adjust menu styling and position when needed
    adjustPosition = () => {
        const { menu } = this.state;
        // If there is no menu, return
        if (!menu) return;

        const match = this.matchCapture();
        if (match === undefined) {
            // No match: remove menu styling
            menu.removeAttribute('style');
            return;
        }

        if (this.matchTrigger() || match) {
            const rect = position()
            if (!rect) { 
                menu.removeAttribute('style');
            } else { 
                menu.style.display = 'block'
                menu.style.opacity = 1
                menu.style.top = `${rect.top + window.pageYOffset}px` // eslint-disable-line no-mixed-operators
                menu.style.left = `${rect.left + window.pageXOffset}px` // eslint-disable-line no-mixed-operators
            }
        }
    }

    // Assigns a value to menu when the portal opens
    openPortal = (portal) => {
        this.setState({
            menu: portal.firstChild 
        });
    }

    // Closes portal
    closePortal = () => {
        const { menu } = this.state;
        // No menu to close: return
        if (!menu) return;

        // Remove menu styling
        menu.removeAttribute('style');
        // Reset default suggestion for elements
        this.setDefaultSuggestion();
        return;
    }

    render = () => {
        const filteredSuggestions  = this.getFilteredSuggestions();

        return (
            <Portal isOpened onOpen={this.openPortal}>
                <div className="suggestion-portal">
                    <ul>
                        {filteredSuggestions.map((suggestion, index) =>
                            <SuggestionItem
                                key={suggestion.key}
                                index={index}
                                suggestion={suggestion}
                                selectedIndex={this.state.selectedIndex}
                                setSelectedIndex={this.setSelectedIndex}
                                appendSuggestion={this.props.callback.onEnter}
                                closePortal={this.closePortal}
                                editor={this.props.callback.editor}
                            />
                        )}
                    </ul>
                </div>
            </Portal>
        );
    }
}

export default SuggestionPortal
