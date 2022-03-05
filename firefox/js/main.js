import { blockArticles } from './block.js';
import { getCafeMemberInfo } from './cafe-apis.js';
import { makeThumbnails } from './thumbnail.js';
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

function getUrlSearchParams() {
    const urlSearchParams = new URLSearchParams(location.search);

    const urlSearchParamsObject = {}

    const entries = urlSearchParams.entries();
    let entryObj = entries.next();

    while (!entryObj.done) {
        const [key, value] = entryObj.value;
        urlSearchParamsObject[key.toLowerCase()] = decodeURIComponent(value);

        entryObj = entries.next();
    }

    return urlSearchParamsObject;
}

export async function main() {
    if (isWakzoo() && await isCafeMember()) {
        const url = decodeURIComponent(location.href);

        if (window.self === window.top) {
            if (url.includes('/articles/write')) {
                installVueDelegator();

                addArticleValidation();
            }
        }
        else {
            if (url.includes('/MyCafeIntro.nhn')) {
                blockArticles(null);
            }
            else if (url.includes('/ArticleList.nhn')) {
                const urlSearchParams = getUrlSearchParams();
                const boardType = urlSearchParams['search.boardtype'] || 'L';

                blockArticles(boardType);

                if (boardType === 'L') {
                    const menuId = urlSearchParams['search.menuid'] || '';
                    const page = urlSearchParams['search.page'] || '1';
                    const perPage = urlSearchParams['userdisplay'] || '15';

                    makeThumbnails(menuId, page, perPage);
                }
            }
            else if (url.includes('/ArticleRead.nhn')) {
                installVueDelegator();

                addCommentValidation();
            }
        }
    }
}