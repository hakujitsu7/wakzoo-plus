import { getArticleList, getArticleSearchList, getBestArticleList } from './misc/cafe-apis.js';

/**
 * 썸네일 목록 가져옵니다.
 * @param {string} type 썸네일 목록 종류
 * @param {string} thumbnailListInfo 썸네일 목록 정보
 * @param {function(): Promise<object[]>} buildThumbnailList 캐시 미스 시 사용할 썸네일 목록 생성 루틴
 * @returns {Promise<object[]>} 썸네일 목록
 */
 async function getThumbnailList(type, thumbnailListInfo, buildThumbnailList) {
    // 로컬 스토리지에서 썸네일 캐시를 가져옵니다.
    //
    // 캐시는 다음과 같은 구조를 가집니다.
    // {
    //     <type: string>: {
    //         thumbnailListInfo: <thumbnailListInfo: string>,
    //         thumbnailList: [
    //             {
    //                 articleId: <articleId: number>,
    //                 thumbnailUrl: <thumbnailUrl: string>
    //             },
    //             ...
    //         ]
    //     },
    //     ...
    // }
    //
    // 캐시를 구성하는 이유는 서버의 부담을 줄이기 위함도 있지만,
    // 가장 큰 이유는 뒤로가기 했을 때 오래된 게시글의 썸네일이 표시되지 않는 버그를 없애기 위함입니다.
    const storage = await chrome.storage.local.get({ thumbnailCache: {} });
    const thumbnailCache = storage.thumbnailCache;

    // 캐시 히트
    if (thumbnailCache[type]?.thumbnailListInfo === thumbnailListInfo) {
        // 썸네일 캐시를 사용할 수 있으므로 썸네일 캐시를 반환합니다.
        return thumbnailCache[type].thumbnailList;
    }
    // 캐시 미스
    else {
        // 썸네일 목록을 만듭니다.
        const thumbnailList = await buildThumbnailList();

        thumbnailCache[type] = {
            thumbnailListInfo: thumbnailListInfo,
            thumbnailList: thumbnailList,
        }

        // 캐시를 최신 상태로 갱신합니다.
        chrome.storage.local.set({ thumbnailCache: thumbnailCache });

        return thumbnailList;
    }
}

/**
 * 게시글 목록에서 썸네일을 생성합니다.
 * @param {string|number} menuId 현재 게시판 아이디
 * @param {string|number} page 현재 페이지
 * @param {string|number} perPage 현재 한 페이지당 게시글 개수
 */
export async function makeThumbnailsInArticleList(menuId, page, perPage) {
    // 게시글 목록에서 공지를 제외하고 가장 상위에 위치한 게시글 아이디를 가져옵니다.
    const firstArticle = document.querySelector('a.article:not(#upperArticleList a.article)');
    const firstArticleId = new URL(firstArticle.href).searchParams.get('articleid');

    // 썸네일 목록 정보를 구성합니다.
    //
    // 해당 정보는 다음과 같은 형식으로 구성됩니다.
    // '["<menuId>","<page>","<perPage>","<firstArticleId>"]'
    //
    // 이 정보는 이후 캐시 사용 가능 여부 판별에 사용됩니다.
    const thumbnailListInfo = JSON.stringify([menuId, page, perPage, firstArticleId]);

    // 썸네일 목록을 가져옵니다.
    const thumbnailList = await getThumbnailList('articleList', thumbnailListInfo, async () => {
        const articleList = await getArticleList(menuId, page, perPage);
        const filteredArticleList = articleList.filter(article => article.representImage);

        return filteredArticleList.map(article => ({
            articleId: article.articleId,
            thumbnailUrl: article.representImage,
        }));
    });

    for (const thumbnail of thumbnailList) {
        const articleElement = document.querySelector(`a.article[href*="articleid=${thumbnail.articleId}"]`)?.closest('tr');

        if (articleElement) {
            articleElement.querySelector('.inner_list').innerHTML +=
                `<span class="list-i-thumb">
                    <img src="${thumbnail.thumbnailUrl}" width="100px" height="100px" alt="">
                </span>`;
        }
    }
}

/**
 * 게시글 검색 목록에서 썸네일을 생성합니다.
 * @param {string|number} menuId 현재 게시판 아이디
 * @param {string|number} page 현재 페이지
 * @param {string|number} perPage 현재 한 페이지당 게시글 개수
 * @param {string} query 현재 검색어
 * @param {string|number} searchBy 현재 검색 기준
 * @param {string} sortBy 현재 정렬 기준
 */
export async function makeThumbnailsInArticleSearchList(menuId, page, perPage, query, searchBy, sortBy) {
    // 게시글 목록에서 공지를 제외하고 가장 상위에 위치한 게시글 아이디를 가져옵니다.
    const firstArticle = document.querySelector('a.article');
    const firstArticleId = new URL(firstArticle.href).searchParams.get('articleid');

    // 썸네일 목록 정보를 구성합니다.
    //
    // 해당 정보는 다음과 같은 형식으로 구성됩니다.
    // '["<menuId>","<page>","<perPage>","<query>","<searchBy>","<sortBy>","<firstArticleId>"]'
    //
    // 이 정보는 이후 캐시 사용 가능 여부 판별에 사용됩니다.
    const thumbnailListInfo = JSON.stringify([menuId, page, perPage, query, searchBy, sortBy, firstArticleId]);

    // 썸네일 목록을 가져옵니다.
    const thumbnailList = await getThumbnailList('articleSearchList', thumbnailListInfo, async () => {
        const articleList = await getArticleSearchList(menuId, page, perPage, query, searchBy, sortBy);
        const filteredArticleList = articleList.filter(article => article.thumbnailImageUrl);

        return filteredArticleList.map(article => ({
            articleId: article.articleId,
            thumbnailUrl: article.thumbnailImageUrl,
        }));
    });

    for (const thumbnail of thumbnailList) {
        const articleElement = document.querySelector(`a.article[href*="articleid=${thumbnail.articleId}"]`)?.closest('tr');

        if (articleElement) {
            articleElement.querySelector('.inner_list').innerHTML +=
                `<span class="list-i-thumb">
                    <img src="${thumbnail.thumbnailUrl}" width="100px" height="100px" alt="">
                </span>`;
        }
    }
}

/**
 * 베스트 게시글 목록에서 썸네일을 생성합니다.
 * @param {string} type 현재 종류
 * @param {string} period 현재 기간
 */
export async function makeThumbnailsInBestArticleList(type, period) {
    // 게시글 목록에서 공지를 제외하고 가장 상위에 위치한 게시글 아이디를 가져옵니다.
    const firstArticle = document.querySelector('tr a:not(.cmt)');
    const firstArticleId = new URL(firstArticle.href).searchParams.get('articleid');

    // 썸네일 목록 정보를 구성합니다.
    //
    // 해당 정보는 다음과 같은 형식으로 구성됩니다.
    // '["<type>","<period>","<firstArticleId>"]'
    //
    // 이 정보는 이후 캐시 사용 가능 여부 판별에 사용됩니다.
    const thumbnailListInfo = JSON.stringify([type, period, firstArticleId]);

    // 썸네일 목록을 가져옵니다.
    const thumbnailList = await getThumbnailList('bestArticleList', thumbnailListInfo, async () => {
        const articleList = await getBestArticleList(type, period);
        const filteredArticleList = articleList.filter(article => article.representImage);

        return filteredArticleList.map(article => ({
            articleId: article.articleId,
            thumbnailUrl: article.representImage,
        }));
    });

    for (const thumbnail of thumbnailList) {
        const articleElement = document.querySelector(`a:not(.cmt)[href*="articleid=${thumbnail.articleId}"]`)?.closest('tr');

        if (articleElement) {
            articleElement.querySelector('.board-list').innerHTML +=
                `<span class="list-i-thumb">
                    <img src="${thumbnail.thumbnailUrl}" width="100px" height="100px" alt="">
                </span>`;
        }
    }
}