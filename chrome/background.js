function isWakzoo(tabId) {
    return new Promise(resolve => {
        chrome.tabs.get(tabId, tab => {
            const signatures = [
                'steamindiegame',
                '27842958',
            ];

            resolve(signatures.some(signature => tab.url.includes(signature)));
        });
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

const subframeUrl = {};

chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.type === 'set_subframe_url') {
        subframeUrl[sender.tab.id] = message.subframeUrl;
    }
});

// 뒤로가기를 새로고침 이벤트로 오인하는 버그가 발견되어 임시적으로 기능을 비활성화하였습니다.
// 나중에 문제가 해결된 후 다시 기능 제공할 예정입니다.
//
// 그럼에도 불구하고 기능 사용을 원하신다면, 아래의 절차를 따라주시기 바랍니다.
//
// 1. 확장 프로그램 관리 페이지에 들어갑니다.
// 2. 화면 우측 상단에 위치한 개발자 모드를 활성화합니다.
// 3. 왁물원 플러스의 서비스 워커를 클릭합니다.
// 4. 서비스 워커의 콘솔에 다음과 같이 입력합니다.
//
// chrome.storage.local.set({ usePreviewFeatures: true });
//
// 만약 다시 기능을 비활성화하려면, 서비스 워커 콘솔에 다음과 같이 입력합니다.
//
// chrome.storage.local.set({ usePreviewFeatures: false });

chrome.webNavigation.onCommitted.addListener(
    details => {
        chrome.storage.local.get({ usePreviewFeatures: false }, async (result) => {
            if (await isWakzoo(details.tabId) && result.usePreviewFeatures) {
                if (['reload', 'auto_subframe'].includes(details.transitionType)) {
                    const originalUrl = subframeUrl[details.tabId];

                    chrome.webNavigation.onCompleted.addListener(function onCompleted() {
                        chrome.webNavigation.onCompleted.removeListener(onCompleted);

                        chrome.tabs.get(details.tabId, tab => {
                            if (!isSameUrl(originalUrl, tab.url)) {
                                chrome.tabs.update(details.tabId, { url: originalUrl });
                            }
                        });
                    });
                }
            }
        });
    },
    { url: [{ hostEquals: 'cafe.naver.com' }] }
);

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