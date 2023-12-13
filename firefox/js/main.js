import * as block from './block.js';
import * as thumbnail from './thumbnail.js';
// import * as validate from './validate.js';

import { getCafeMemberInfo } from './misc/cafe-apis.js';
import { tryDecodeURIComponent, getUrlSearchParams, cp949ToUtf8InUrlSearchParams } from './misc/url.js';
// import { installVueDelegator } from './misc/vue-delegator.js';

/**
 * URL을 통해 현재 카페가 왁물원인지 확인합니다.
 * @returns {boolean} 왁물원인지 여부
 */
function isWakzoo() {
    const signatures = [
        'steamindiegame',
        '27842958',
    ];

    return signatures.some(signature => location.href.includes(signature));
}

/**
 * 현재 카페 멤버로 로그인되어 있는지 확인합니다.  
 * 만약 로그아웃 상태라면 false를 반환합니다.
 * @returns {boolean} 카페 멤버인지 여부
 */
async function isCafeMember() {
    const cafeMemberInfo = await getCafeMemberInfo();

    return cafeMemberInfo.cafeMember;
}

export async function main() {
    const cafeMember = await isCafeMember();

    // 현재 카페가 왁물원인 경우에만 작동합니다.
    if (isWakzoo()) {
        const url = tryDecodeURIComponent(location.href);

        // iframe을 사용하지 않는 경우
        if (window.self === window.top) {
            // 카페 글쓰기
            if (url.includes('/articles/write') && cafeMember) {
                // installVueDelegator();

                // validate.addArticleValidation();
            }
        }
        // iframe을 사용하는 경우
        else {
            browser.runtime.sendMessage({
                type: 'set_subframe_url',
                subframeUrl: location.href,
            });

            // 카페 메인
            if (url.includes('/MyCafeIntro.nhn')) {
                if (cafeMember) {
                    block.blockArticlesInMyCafeIntro();
                }
            }
            // 게시글 목록
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
            // 게시글 검색 목록
            else if (url.includes('/ArticleSearchList.nhn')) {
                if (cafeMember) {
                    block.blockArticlesInArticleSearchList();
                }

                const utf8Search = cp949ToUtf8InUrlSearchParams('search.query');
                const urlSearchParams = getUrlSearchParams(utf8Search);

                const menuId = urlSearchParams['search.menuid'] || '';
                const page = urlSearchParams['search.page'] || '1';
                const perPage = urlSearchParams['userdisplay'] || '15';

                const query = urlSearchParams['search.query'] || '';
                const searchBy = urlSearchParams['search.searchby'] || '0';
                const sortBy = urlSearchParams['search.sortby'] || 'date';

                thumbnail.makeThumbnailsInArticleSearchList(menuId, page, perPage, query, searchBy, sortBy);
            }
            // 베스트 게시글 목록
            else if (url.includes('/BestArticleList.nhn')) {
                if (cafeMember) {
                    block.blockArticlesInBestArticleList();
                }

                const urlSearchParams = getUrlSearchParams();

                const type = urlSearchParams['period'] || 'week';
                const period = urlSearchParams['listtype'] || 'commentcount';

                thumbnail.makeThumbnailsInBestArticleList(type, period === 'commentcount' ? 'comment' : 'likeIt');
            }
            // 게시글 읽기
            else if (url.includes('/ArticleRead.nhn') && cafeMember) {
                // installVueDelegator();

                // validate.addCommentValidation();
            }
        }
    }
}