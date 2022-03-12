import { blockArticles } from './block.js';
import { getCafeMemberInfo } from './cafe-apis.js';
import { makeThumbnailsInArticleList } from './thumbnail.js';
import { addArticleValidation, addCommentValidation } from './validate.js';
import { installVueDelegator } from './vue-delegator.js';

function isWakzoo() {
    const signatures = [
        'steamindiegame',
        '27842958',
    ];

    return signatures.some(signature => location.href.includes(signature));
}

async function isCafeMember() {
    const cafeMemberInfo = await getCafeMemberInfo();

    return cafeMemberInfo.cafeMember;
}

function tryDecodeURIComponent(url) {
    try {
        return decodeURIComponent(url);
    }
    catch {
        return url;
    }
}

function getUrlSearchParams() {
    const urlSearchParams = new URLSearchParams(location.search);

    const urlSearchParamsObject = {}

    for (const [key, value] of urlSearchParams.entries()) {
        urlSearchParamsObject[key.toLowerCase()] = tryDecodeURIComponent(value);
    }

    return urlSearchParamsObject;
}

export async function main() {
    const cafeMember = await isCafeMember();

    if (isWakzoo()) {
        const url = tryDecodeURIComponent(location.href);

        if (window.self === window.top) {
            if (url.includes('/articles/write') && cafeMember) {
                installVueDelegator();

                addArticleValidation();
            }
        }
        else {
            chrome.runtime.sendMessage({
                type: 'set_subframe_url',
                subframeUrl: location.href,
            });

            if (url.includes('/MyCafeIntro.nhn')) {
                if (cafeMember) {
                    blockArticles(null);
                }
            }
            else if (url.includes('/ArticleList.nhn')) {
                const urlSearchParams = getUrlSearchParams();
                const boardType = urlSearchParams['search.boardtype'] || 'L';

                if (cafeMember) {
                    blockArticles(boardType);
                }

                if (boardType === 'L') {
                    const menuId = urlSearchParams['search.menuid'] || '';
                    const page = urlSearchParams['search.page'] || '1';
                    const perPage = urlSearchParams['userdisplay'] || '15';

                    makeThumbnailsInArticleList(menuId, page, perPage);
                }
            }
            else if (url.includes('/ArticleRead.nhn') && cafeMember) {
                installVueDelegator();

                addCommentValidation();
            }
        }
    }
}