import { getArticleList } from './cafe-apis.js';

export async function makeThumbnails(menuId, page, perPage) {
    const articleList = await getArticleList(menuId, page, perPage);

    for (const article of articleList.filter(article => article.representImage)) {
        const articleElement = document.querySelector(`a.article[href*="articleid=${article.articleId}"]`)?.closest('tr');

        if (articleElement) {
            articleElement.querySelector('.inner_list').innerHTML +=
                `<span class="list-i-thumb">
                    <img src="${article.representImage}" width="100px" height="100px" alt="">
                </span>`
        }
    }
}