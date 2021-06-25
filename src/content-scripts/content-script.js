const WINDOW_CONSTANTS = {
  cloneTarget: 'extensionMailMessageCloneTargetNode',
  message: 'extensionMailMessage',
  listener: 'extensionMailMessageListener',
  elementListener: 'extensionMailMessageElementListener'
}

function clickListener () {
  window.addEventListener('click', () => {
    const targetNode = document.body.querySelector('div[g_editable="true"][role="textbox"]:not(email-message-suggestion__timed-visible)')
    if (targetNode && !window[WINDOW_CONSTANTS.elementListener]) {
      window[WINDOW_CONSTANTS.elementListener] = true
      reddenPage()
    } else {
      window[WINDOW_CONSTANTS.elementListener] = false
    }
  })
}

function reddenPage () {
  if (document.readyState !== 'complete') return
  const suggestions = [
    'Do you have time to meet next week?',
    'I have forwarded this message to the appropriate service rep.',
    "If you're not the right person, can you please put me in touch with whoever is?",
    'Thanks again for chatting today and I look forward to hearing from you!'
  ]

  function findSuggestion (word, isOriginalString) {
    for (const suggestion of suggestions) {
      if (!(suggestion.length >= word.length)) {
        continue
      }
      const mainString = word
      let suggestionString = suggestion
      let incorrect = false
      let count = 0
      for (const i of mainString) {
        if (incorrect) break
        if (i.toLowerCase() !== suggestion[count].toLowerCase()) {
          incorrect = true
        }
        suggestionString = suggestionString.slice(0, count) + i + suggestionString.slice(count + 1, suggestionString.length)
        count++
      }
      if (!incorrect) {
        if (isOriginalString) {
          return suggestion
        }
        return suggestionString
      }
    }
    return ''
  }

  function tabButtonSuggest (e) {
    if (e?.key?.toLowerCase() === 'tab') {
      e.preventDefault()
      const mainString = window[WINDOW_CONSTANTS.message]
      const suggestionMessage = findSuggestion(mainString, true)
      if (!suggestionMessage.length) return
      const timedEls = document.querySelectorAll('#email-message-suggestion__timed')
      if (timedEls?.length) {
        timedEls.forEach(item => item.remove())
      }
      const targetNode = document.body.querySelector('div[g_editable="true"][role="textbox"]:not(email-message-suggestion__timed-visible)')
      targetNode.innerHTML = targetNode.innerHTML.replace(window[WINDOW_CONSTANTS.message], suggestionMessage)
      window[WINDOW_CONSTANTS.message] = suggestionMessage
    }
  }

  function autoSuggest (mutationList) {
    mutationList.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const innerText = mutation.target.innerText
        let parseString = ''
        for (let index = 0; index < innerText.length; index++) {
          const word = innerText[index]
          if (word === '\n') {
            break
          }
          parseString = `${parseString}${word}`
        }
        window[WINDOW_CONSTANTS.message] = parseString
        if (!parseString.length) return
        const suggestionWord = findSuggestion(parseString)
        if (suggestionWord?.length) {
          window[WINDOW_CONSTANTS.cloneTarget].style.visibility = 'visible'
          const span = document.createElement('span')
          span.id = 'email-message-suggestion__timed'
          span.style.opacity = '0.5'
          span.style.userSelect = 'none'
          span.pointerEvents = 'none'
          span.innerHTML = suggestionWord
          window[WINDOW_CONSTANTS.cloneTarget].innerHTML = span.outerHTML
        } else {
          window[WINDOW_CONSTANTS.cloneTarget].style.visibility = 'hidden'
        }
      }
    })
  }

  function cloneTargetNode (targetNode) {
    const clonedTargetNode = targetNode.cloneNode(true)
    clonedTargetNode.id = 'email-message-suggestion__timed-visible'
    clonedTargetNode.style.background = 'transparent'
    clonedTargetNode.style.position = 'absolute'
    clonedTargetNode.style.zIndex = '1'
    clonedTargetNode.style.visibility = 'hidden'
    clonedTargetNode.style.userSelect = 'none'
    clonedTargetNode.style.top = '10px'
    clonedTargetNode.style.left = '0'
    window[WINDOW_CONSTANTS.cloneTarget] = clonedTargetNode
    targetNode.parentElement.append(clonedTargetNode)
  }

  // start action
  const targetNode = document.body.querySelector('div[g_editable="true"][role="textbox"]:not(email-message-suggestion__timed-visible)')
  targetNode.style.background = 'transparent'
  targetNode.style.position = 'relative'
  targetNode.style.zIndex = '2'
  targetNode.parentElement.style.position = 'relative'
  cloneTargetNode(targetNode)
  if (targetNode) {
    window.addEventListener('click', (e) => {
      if (e.target.id === 'email-message-suggestion__timed-visible') return
      const timedEls = document.querySelectorAll('#email-message-suggestion__timed')
      const timedVisibleEls = document.querySelectorAll('#email-message-suggestion__timed-visible')
      if (timedEls?.length) {
        timedEls.forEach(item => item.remove())
      }
      if (timedVisibleEls?.length) {
        timedVisibleEls.forEach((item) => {
          item.style.visibility = 'hidden'
        })
      }
    })
    const observerOptions = {
      attributes: true,
      subtree: false
    }

    const observer = new MutationObserver(autoSuggest)
    observer.observe(targetNode, observerOptions)
    targetNode.onkeydown = (e) => tabButtonSuggest(e)
  }
}

if (!window[WINDOW_CONSTANTS.listener]) {
  window[WINDOW_CONSTANTS.listener] = true
  document.addEventListener('readystatechange', clickListener)
}
