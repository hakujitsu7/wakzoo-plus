import { getBlockMemberList, getMemberKeyByMemberId } from './misc/cafe-apis.js';

/**
 * 차단한 멤버 키 리스트를 가져옵니다.
 * @returns {Promise<string[]>} 차단한 멤버 키 리스트
 */
async function getBlockMemberKeyList() {
    const blockMemberList = await getBlockMemberList();

    const storage = await browser.storage.local.get({ blockMemberKeyCache: {} });

    const blockMemberKeyTable = {};
    const blockMemberKeyCache = storage.blockMemberKeyCache;

    for (const blockMember of blockMemberList) {
        blockMemberKeyTable[blockMember] =
            blockMemberKeyCache[blockMember] || await getMemberKeyByMemberId(blockMember);
    }

    browser.storage.local.set({ blockMemberKeyCache: blockMemberKeyTable });

    return Object.values(blockMemberKeyTable);
}

/**
 * 카페 메인 화면에서 차단한 멤버의 게시글을 가립니다.
 */
export async function blockArticlesInMyCafeIntro() {
    const blockMemberKeyList = await getBlockMemberKeyList();

    for (const blockMemberKey of blockMemberKeyList) {
        const articleElementList = [...document.querySelectorAll(`a[onclick*="${blockMemberKey}"]`)];
        articleElementList.forEach((targetArticle, index) => {
            articleElementList[index] = targetArticle.closest('li,tr:not(:is(li,td) tr)');
        });

        for (const articleElement of articleElementList) {
            articleElement.style.display = 'none';
        }
    }
}

/**
 * 게시글 목록에서 차단한 멤버의 게시글을 가립니다.
 * @param {string} boardType 현재 게시글 목록 형식
 */
export async function blockArticlesInArticleList(boardType) {
    const blockMemberKeyList = await getBlockMemberKeyList();

    for (const blockMemberKey of blockMemberKeyList) {
        const articleElementList = [...document.querySelectorAll(`a[onclick*="${blockMemberKey}"]`)];
        articleElementList.forEach((targetArticle, index) => {
            articleElementList[index] = targetArticle.closest('li,tr:not(:is(li,td) tr)');
        });

        // 목록형
        if (boardType === 'L') {
            for (const articleElement of articleElementList) {
                const href = articleElement.querySelector('a[href*="/ArticleRead.nhn"]').href;

                articleElement.innerHTML =
                    `<td colspan="5" style="color: #676767;">
                        <a href="${href}">차단한 멤버의 게시글입니다.</a>
                    </td>`;
            }
        }
        // 카드형
        else if (boardType === 'C') {
            for (const articleElement of articleElementList) {
                const href = articleElement.querySelector('a[href*="/ArticleRead.nhn"]').href;

                articleElement.innerHTML =
                    `<a href="${href}" style="color: #676767;">차단한 멤버의 게시글입니다.</a>`;
            }
        }
        // 앨범형, 동영상형
        else {
            for (const articleElement of articleElementList) {
                articleElement.style.display = 'none';
            }
        }
    }
}

/**
 * 게시글 검색 목록에서 차단한 멤버의 게시글을 가립니다.
 */
export async function blockArticlesInArticleSearchList() {
    const blockMemberKeyList = await getBlockMemberKeyList();

    for (const blockMemberKey of blockMemberKeyList) {
        const articleElementList = [...document.querySelectorAll(`a[onclick*="${blockMemberKey}"]`)];
        articleElementList.forEach((targetArticle, index) => {
            articleElementList[index] = targetArticle.closest('li,tr:not(:is(li,td) tr)');
        });

        for (const articleElement of articleElementList) {
            const href = articleElement.querySelector('a[href*="/ArticleRead.nhn"]').href;

            articleElement.innerHTML =
                `<td colspan="5" style="color: #676767;">
                    <a href="${href}">차단한 멤버의 게시글입니다.</a>
                </td>`;
        }
    }
}

/**
 * 베스트 게시글 목록에서 차단한 멤버의 게시글을 가립니다.
 */
export async function blockArticlesInBestArticleList() {
    const blockMemberKeyList = await getBlockMemberKeyList();

    for (const blockMemberKey of blockMemberKeyList) {
        const articleElementList = [...document.querySelectorAll(`a[onclick*="${blockMemberKey}"]`)];
        articleElementList.forEach((targetArticle, index) => {
            articleElementList[index] = targetArticle.closest('li,tr:not(:is(li,td) tr)');
        });

        for (const articleElement of articleElementList) {
            const href = articleElement.querySelector('a[href*="/ArticleRead.nhn"]').href;

            articleElement.innerHTML =
                `<td colspan="7" align="left" style="color: #676767;">
                    <a href="${href}">차단한 멤버의 게시글입니다.</a>
                </td>`;
        }
    }
}