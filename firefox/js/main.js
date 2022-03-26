import { blockArticles } from './block.js';
import { getCafeMemberInfo } from './cafe-apis.js';
import { makeThumbnailsInArticleList, makeThumbnailsInArticleSearchList, makeThumbnailsInBestArticleList } from './thumbnail.js';
import { tryDecodeURIComponent, getUrlSearchParams, cp949ToUtf8InUrlSearchParams } from './url.js';
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
            browser.runtime.sendMessage({
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
            else if (url.includes('/ArticleSearchList.nhn')) {
                const utf8Search = cp949ToUtf8InUrlSearchParams('search.query');
                const urlSearchParams = getUrlSearchParams(utf8Search);

                const menuId = urlSearchParams['search.menuid'] || '';
                const page = urlSearchParams['search.page'] || '1';
                const perPage = urlSearchParams['userdisplay'] || '15';

                const query = urlSearchParams['search.query'] || '';
                const searchBy = urlSearchParams['search.searchby'] || '0';
                const sortBy = urlSearchParams['search.sortby'] || 'date';

                makeThumbnailsInArticleSearchList(menuId, page, perPage, query, searchBy, sortBy);
            }
            else if (url.includes('/BestArticleList.nhn')) {
                const urlSearchParams = getUrlSearchParams();

                const type = urlSearchParams['period'] || 'week';
                const period = urlSearchParams['listtype'] || 'commentcount';

                makeThumbnailsInBestArticleList(type, period === 'commentcount' ? 'comment' : 'likeIt');
            }
            else if (url.includes('/ArticleRead.nhn') && cafeMember) {
                installVueDelegator();

                addCommentValidation();
            }
        }
    }
}