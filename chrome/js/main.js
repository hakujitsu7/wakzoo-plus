import * as block from './block.js';
import * as thumbnail from './thumbnail.js';
import * as validate from './validate.js';

import { getCafeMemberInfo } from './misc/cafe-apis.js';
import { tryDecodeURIComponent, getUrlSearchParams, cp949ToUtf8InUrlSearchParams } from './misc/url.js';
import { installVueDelegator } from './misc/vue-delegator.js';

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

                validate.addArticleValidation();
            }
        }
        else {
            if (url.includes('/MyCafeIntro.nhn')) {
                if (cafeMember) {
                    block.blockArticlesInMyCafeIntro();
                }
            }
            else if (url.includes('/ArticleList.nhn')) {
                const urlSearchParams = getUrlSearchParams();
                const boardType = urlSearchParams['search.boardtype'] || 'L';

                if (cafeMember) {
                    block.blockArticlesInArticleList(boardType);
                }

                if (boardType === 'L') {
                    const menuId = urlSearchParams['search.menuid'] || '';
                    const page = urlSearchParams['search.page'] || '1';
                    const perPage = urlSearchParams['userdisplay'] || '15';

                    thumbnail.makeThumbnailsInArticleList(menuId, page, perPage);
                }
            }
            else if (url.includes('/ArticleSearchList.nhn')) {
                console.log(url);
                if (cafeMember) {
                    block.blockArticlesInArticleSearchList();
                }

                const utf8Search = cp949ToUtf8InUrlSearchParams('search.query');
                const urlSearchParams = getUrlSearchParams(utf8Search);
                console.log(urlSearchParams);
                const menuId = urlSearchParams['search.menuid'] || '';
                const page = urlSearchParams['search.page'] || '1';
                const perPage = urlSearchParams['userdisplay'] || '15';

                const query = urlSearchParams['search.query'] || '';
                const searchBy = urlSearchParams['search.searchby'] || '0';
                const sortBy = urlSearchParams['search.sortby'] || 'date';

                thumbnail.makeThumbnailsInArticleSearchList(menuId, page, perPage, query, searchBy, sortBy);
            }
            else if (url.includes('/BestArticleList.nhn')) {
                if (cafeMember) {
                    block.blockArticlesInBestArticleList();
                }

                const urlSearchParams = getUrlSearchParams();

                const type = urlSearchParams['period'] || 'week';
                const period = urlSearchParams['listtype'] || 'commentcount';

                thumbnail.makeThumbnailsInBestArticleList(type, period === 'commentcount' ? 'comment' : 'likeIt');
            }
            else if (url.includes('/ArticleRead.nhn') && cafeMember) {
                installVueDelegator();

                validate.addCommentValidation();
            }
        }
    }
}