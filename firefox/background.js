function ifWakzoo(tabId, callback) {
    chrome.tabs.get(tabId, tab => {
        const signatures = ["steamindiegame", "27842958"];

        if (signatures.some(signature => tab.url.includes(signature))) {
            callback();
        }
    });
}

const currentLocation = {};

chrome.webRequest.onBeforeRequest.addListener(
    details => {
        if (details.method === "GET" && details.type === "sub_frame") {
            ifWakzoo(details.tabId, () => {
                currentLocation[details.tabId] = details.url;
            });
        }
    },
    { urls: ["*://cafe.naver.com/*"] }
);

chrome.webNavigation.onCommitted.addListener(
    details => {
        if (details.transitionType === "reload") {
            ifWakzoo(details.tabId, () => {
                chrome.tabs.update(details.tabId, { url: currentLocation[details.tabId] });
            });
        }
    },
    { url: [{ hostEquals: "cafe.naver.com" }] }
);