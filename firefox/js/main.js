import { blockArticles } from './block.js';
import { getCafeMemberInfo } from './cafe-apis.js';
import { makeThumbnails } from './thumbnail.js';

function isWakzoo() {
    const signatures = ['steamindiegame', '27842958'];

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
        urlSearchParamsObject[key.toLowerCase()] = value;

        entryObj = entries.next();
    }

    return urlSearchParamsObject;
}

export async function main() {
    if (isWakzoo() && await isCafeMember()) {
        if (window.self === window.top) {

        }
        else {
            if (location.href.includes('/MyCafeIntro.nhn')) {
                blockArticles(null);
            }
            else if (location.href.includes('/ArticleList.nhn')) {
                const urlSearchParams = getUrlSearchParams();
                const boardType = urlSearchParams['search.boardtype'] || 'L';

                blockArticles(boardType);

                if (boardType === 'L') {
                    const menuId = urlSearchParams['search.menuid'] || '';
                    const page = urlSearchParams['search.page'] || '1';
                    const perPage = urlSearchParams['search.userdisplay'] || '15';

                    makeThumbnails(menuId, page, perPage);
                }
            }
            else if (location.href.includes('/ArticleRead.nhn')) {

            }
        }
    }
}