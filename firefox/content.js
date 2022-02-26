function isWakzoo() {
    const signatures = ["steamindiegame", "27842958"];

    return signatures.some(signature => location.href.includes(signature));
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

(async function () {
    if (isWakzoo()) {
        if (window.self === window.top) {

        }
        else {
            if (location.href.includes("MyCafeIntro.nhn")) {

            }
            else if (location.href.includes("ArticleList.nhn")) {
                const urlSearchParams = getUrlSearchParams();

                const boardType = urlSearchParams['search.boardtype'] || 'L';
                const menuId = urlSearchParams['search.menuid'] || '';
                const page = urlSearchParams['search.page'] || '1';
                const perPage = urlSearchParams['search.userdisplay'] || '15';

                if (boardType === "L") {
                    const articleList = await getArticleListAndBlockMemberList(menuId, page, perPage);

                    for (const article of articleList.articleList) {
                        if (articleList.blockMemberList.includes(article.writerId)) {
                            const articleElement = document.querySelector(`a.article[href*="articleid=${article.articleId}"]`)?.closest("tr");
                            articleElement.innerHTML = '<td style="color: #676767;" colspan="5">차단한 멤버의 게시글입니다.</td>';
                        }
                    }
                }
            }
            else if (location.href.includes("ArticleRead.nhn")) {

            }
        }
    }
})();