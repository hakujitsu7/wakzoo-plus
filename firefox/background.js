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
                chrome.extension.getBackgroundPage().console.log(details);

                const url = new URL(details.url);
                const iframeUrl = encodeURIComponent(url.pathname + url.search);
                
                currentLocation[details.tabId] = `https://cafe.naver.com/steamindiegame?iframe_url_utf8=${iframeUrl}`
            });
        }
    },
    { urls: ["*://cafe.naver.com/*"] }
);

chrome.webNavigation.onCommitted.addListener(
    details => {
        if (details.transitionType === "reload") {
            ifWakzoo(details.tabId, () => {
                chrome.extension.getBackgroundPage().console.log(details);

                chrome.webNavigation.onCompleted.addListener(function onCompleted() {
                    chrome.tabs.update(details.tabId, { url: currentLocation[details.tabId] });
        
                    chrome.webNavigation.onCompleted.removeListener(onCompleted);
                });
            })
        }
    },
    { url: [{ hostEquals: "cafe.naver.com" }] }
);