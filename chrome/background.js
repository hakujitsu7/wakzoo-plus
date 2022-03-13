chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url.includes('/storyphoto/viewer.html') && changeInfo.status === 'complete') {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                const eventTypeList = [
                    'contextmenu',
                    'mouseup',
                    'mousedown',
                    'dragstart',
                    'selectstart',
                ];

                for (const eventType of eventTypeList) {
                    document.addEventListener(eventType, event => event.stopImmediatePropagation(), true);
                }
            },
        });
    }
});