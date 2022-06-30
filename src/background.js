chrome.runtime.onInstalled.addListener(() => {
    console.log('The extension has installed success!')
    chrome.runtime.openOptionsPage(() => console.log('open options page success.'));
});
