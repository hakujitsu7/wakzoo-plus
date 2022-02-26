import { getBlockMemberList } from './cafe-apis.js';

export async function blockArticles(boardType) {
    const blockMemberList = await getBlockMemberList();

    for (const blockMember of blockMemberList) {
        const targetArticleList = [...document.querySelectorAll(`a[onclick^="ui(event, '${blockMember}'"]`)];
        targetArticleList.forEach((targetArticle, index) => {
            targetArticleList[index] = targetArticle.closest('li,tr:not(:is(li,td) tr)');
        });

        if (boardType === 'L') {
            for (const targetArticle of targetArticleList) {
                const href = targetArticle.querySelector('a.article').href;

                targetArticle.innerHTML =
                    `<td colspan="5" style="color: #676767;">
                        <a href="${href}">차단한 멤버의 게시글입니다.</a>
                    </td>`;
            }
        }
        else if (boardType === 'C') {
            for (const targetArticle of targetArticleList) {
                const href = targetArticle.querySelector('a.tit').href;

                targetArticle.innerHTML =
                    `<a href="${href}" style="color: #676767;">차단한 멤버의 게시글입니다.</a>`;
            }
        }
        else {
            for (const targetArticle of targetArticleList) {
                targetArticle.style.display = 'none';
            }
        }
    }
}