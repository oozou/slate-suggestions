function getCurrentWord(text, index, trigger) {
    const startIndex = text.lastIndexOf(trigger, index + 1)
    return text.substring(startIndex, index + 1)
}

export default getCurrentWord
