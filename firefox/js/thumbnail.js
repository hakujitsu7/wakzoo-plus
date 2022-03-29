import { getArticleList, getArticleSearchList, getBestArticleList } from './misc/cafe-apis.js';

/**
 * 게시글 목록에서 썸네일을 생성합니다.
 * @param {string|number} menuId 현재 게시판 아이디
 * @param {string|number} page 현재 페이지
 * @param {string|number} perPage 현재 한 페이지당 게시글 개수
 */
export async function makeThumbnailsInArticleList(menuId, page, perPage) {
    const storage = await browser.storage.local.get({ articleListThumbnailCache: {} });

    const firstArticle = document.querySelector('a.article:not(#upperArticleList a.article)');
    const firstArticleId = new URL(firstArticle.href).searchParams.get('articleid');

    const thumbnailListInfo = JSON.stringify([menuId, page, perPage, firstArticleId]);

    let thumbnailList;

    if (thumbnailListInfo === storage.articleListThumbnailCache.thumbnailListInfo) {
        thumbnailList = storage.articleListThumbnailCache.thumbnailList;
    }
    else {
        const articleList = await getArticleList(menuId, page, perPage);

        const filteredArticleList = articleList.filter(article => article.representImage);
        thumbnailList = filteredArticleList.map(article => ({
            articleId: article.articleId,
            thumbnailUrl: article.representImage,
        }));

        browser.storage.local.set({
            articleListThumbnailCache: {
                thumbnailListInfo: thumbnailListInfo,
                thumbnailList: thumbnailList,
            }
        });
    }

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
    const storage = await browser.storage.local.get({ articleSearchListThumbnailCache: {} });

    const firstArticle = document.querySelector('a.article');
    const firstArticleId = new URL(firstArticle.href).searchParams.get('articleid');

    const thumbnailListInfo = JSON.stringify([menuId, page, perPage, query, searchBy, sortBy, firstArticleId]);

    let thumbnailList;

    if (thumbnailListInfo === storage.articleSearchListThumbnailCache.thumbnailListInfo) {
        thumbnailList = storage.articleSearchListThumbnailCache.thumbnailList;
    }
    else {
        const articleList = await getArticleSearchList(menuId, page, perPage, query, searchBy, sortBy);

        const filteredArticleList = articleList.filter(article => article.thumbnailImageUrl);
        thumbnailList = filteredArticleList.map(article => ({
            articleId: article.articleId,
            thumbnailUrl: article.thumbnailImageUrl,
        }));

        browser.storage.local.set({
            articleSearchListThumbnailCache: {
                thumbnailListInfo: thumbnailListInfo,
                thumbnailList: thumbnailList,
            }
        });
    }

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
    const storage = await browser.storage.local.get({ bestArticleListThumbnailCache: {} });

    const firstArticle = document.querySelector('tr a:not(.cmt)');
    const firstArticleId = new URL(firstArticle.href).searchParams.get('articleid');

    const thumbnailListInfo = JSON.stringify([type, period, firstArticleId]);

    let thumbnailList;

    if (thumbnailListInfo === storage.bestArticleListThumbnailCache.thumbnailListInfo) {
        thumbnailList = storage.bestArticleListThumbnailCache.thumbnailList;
    }
    else {
        const articleList = await getBestArticleList(type, period);

        const filteredArticleList = articleList.filter(article => article.representImage);
        thumbnailList = filteredArticleList.map(article => ({
            articleId: article.articleId,
            thumbnailUrl: article.representImage,
        }));

        browser.storage.local.set({
            bestArticleListThumbnailCache: {
                thumbnailListInfo: thumbnailListInfo,
                thumbnailList: thumbnailList,
            }
        });
    }

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