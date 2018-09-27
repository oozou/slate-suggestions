function getCurrentWord(text, index, initialIndex) {
 
  if (text[index] === " " || text[index] === undefined) return ""
  if (index < initialIndex) {
    return getCurrentWord(text, index - 1, initialIndex) + text[index]
  }
  if (index > initialIndex) {
    return text[index] + getCurrentWord(text, index + 1, initialIndex)
  }
  return getCurrentWord(text, index - 1, initialIndex) + text[index] + getCurrentWord(text, index + 1, initialIndex)
  
}

export default getCurrentWord
