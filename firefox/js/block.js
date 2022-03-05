import { getBlockMemberList, getMemberKeyByMemberId } from './cafe-apis.js';

export function blockArticles(boardType) {
    browser.storage.local.get({ blockMemberKeyCache: {} }, async (result) => {
        const blockMemberList = await getBlockMemberList();

        const blockMemberKeyTable = {};
        const blockMemberKeyCache = result.blockMemberKeyCache;

        for (const blockMember of blockMemberList) {
            blockMemberKeyTable[blockMember] =
                blockMemberKeyCache[blockMember] || await getMemberKeyByMemberId(blockMember);
        }

        browser.storage.local.set({ blockMemberKeyCache: blockMemberKeyTable });

        for (const blockMemberKey of Object.values(blockMemberKeyTable)) {
            const articleElementList = [...document.querySelectorAll(`a[onclick*="${blockMemberKey}"]`)];
            articleElementList.forEach((targetArticle, index) => {
                articleElementList[index] = targetArticle.closest('li,tr:not(:is(li,td) tr)');
            });

            if (boardType === 'L') {
                for (const articleElement of articleElementList) {
                    const href = articleElement.querySelector('a.article').href;

                    articleElement.innerHTML =
                        `<td colspan="5" style="color: #676767;">
                            <a href="${href}">차단한 멤버의 게시글입니다.</a>
                        </td>`;
                }
            }
            else if (boardType === 'C') {
                for (const articleElement of articleElementList) {
                    const href = articleElement.querySelector('a.tit').href;

                    articleElement.innerHTML =
                        `<a href="${href}" style="color: #676767;">차단한 멤버의 게시글입니다.</a>`;
                }
            }
            else {
                for (const articleElement of articleElementList) {
                    articleElement.style.display = 'none';
                }
            }
        }
    });
}