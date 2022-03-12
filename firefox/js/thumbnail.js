import { getArticleList } from './cafe-apis.js';

export async function makeThumbnailsInArticleList(menuId, page, perPage) {
    const storage = await browser.storage.local.get({ thumbnailCache: {} });

    const firstArticle = document.querySelector('a.article:not(#upperArticleList a.article)');
    const firstArticleId = new URL(firstArticle.href).searchParams.get('articleid');

    const articleListInfo = JSON.stringify([menuId, page, perPage, firstArticleId]);

    let thumbnailList;

    if (articleListInfo === storage.thumbnailCache.articleListInfo) {
        thumbnailList = storage.thumbnailCache.thumbnailList;
    }
    else {
        const articleList = await getArticleList(menuId, page, perPage);

        const filteredArticleList = articleList.filter(article => article.representImage);
        thumbnailList = filteredArticleList.map(article => ({
            articleId: article.articleId,
            thumbnailUrl: article.representImage,
        }));

        browser.storage.local.set({
            thumbnailCache: {
                articleListInfo: articleListInfo,
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
                </span>`
        }
    }
}