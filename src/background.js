async function getCurrentTab () {
  const queryOptions = { active: true, currentWindow: true }
  const [tab] = await browser.tabs.query(queryOptions)
  return tab
}

chrome.tabs.onUpdated.addListener(() => checkTab())

async function checkTab () {
  const currentTab = await getCurrentTab()
  if (currentTab?.url.slice(0, 23).includes('https://mail.google.com')) {
    browser.tabs.executeScript({
      file: 'js/content-script.js'
    })
  }
}
