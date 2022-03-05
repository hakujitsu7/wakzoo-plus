function ifWakzoo(tabId, callback) {
    chrome.tabs.get(tabId, tab => {
        const signatures = [
            'steamindiegame',
            '27842958',
        ];

        if (signatures.some(signature => tab.url.includes(signature))) {
            callback();
        }
    });
}

function isSameUrl(lhs, rhs) {
    try {
        const lhsUrl = new URL(lhs);
        const rhsUrl = new URL(rhs);

        const lhsIframeUrl = lhsUrl.searchParams.get('iframe_url') || lhsUrl.searchParams.get('iframe_url_utf8');
        const rhsIframeUrl = rhsUrl.searchParams.get('iframe_url') || rhsUrl.searchParams.get('iframe_url_utf8');

        const lhsFilename = lhsUrl.pathname.substring(lhsUrl.pathname.lastIndexOf('/'));
        const rhsFilename = rhsUrl.pathname.substring(rhsUrl.pathname.lastIndexOf('/'));

        const lhsSearch = lhsUrl.search;
        const rhsSearch = rhsUrl.search;

        const actualLhsUrl = decodeURIComponent(lhsIframeUrl || `${lhsFilename}${lhsSearch}`);
        const actualRhsUrl = decodeURIComponent(rhsIframeUrl || `${rhsFilename}${rhsSearch}`);

        return actualLhsUrl === actualRhsUrl;
    }
    catch {
        return false;
    }
}

function enableRightClick() {
    const eventTypeList = [
        'contextmenu',
        'mouseup',
        'mousedown',
        'dragstart',
        'selectstart',
    ];

    for (const eventType of eventTypeList) {
        document.addEventListener(eventType, event => {
            event.stopImmediatePropagation();
        }, true);
    }
}

const currentUrl = {};

chrome.webRequest.onBeforeRequest.addListener(
    details => {
        if (details.method === 'GET' && details.type === 'sub_frame') {
            ifWakzoo(details.tabId, () => {
                currentUrl[details.tabId] = details.url;
            });
        }
    },
    { urls: ['*://cafe.naver.com/*'] }
);

chrome.webNavigation.onCommitted.addListener(
    details => {
        if (details.transitionType === 'reload') {
            ifWakzoo(details.tabId, () => {
                chrome.webNavigation.onCompleted.addListener(function onCompleted() {
                    chrome.webNavigation.onCompleted.removeListener(onCompleted);

                    chrome.tabs.get(details.tabId, tab => {
                        if (!isSameUrl(currentUrl[details.tabId], tab.url)) {
                            chrome.tabs.update(details.tabId, { url: currentUrl[details.tabId] });
                        }
                    });
                });
            });
        }
    },
    { url: [{ hostEquals: 'cafe.naver.com' }] }
);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url.includes('/storyphoto/viewer.html') && changeInfo.status === 'complete') {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: enableRightClick,
        });
    }
});