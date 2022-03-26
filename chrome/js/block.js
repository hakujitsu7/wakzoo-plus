import { getBlockMemberList, getMemberKeyByMemberId } from './misc/cafe-apis.js';

async function getBlockMemberKeyList() {
    const blockMemberList = await getBlockMemberList();

    const storage = await chrome.storage.local.get({ blockMemberKeyCache: {} });

    const blockMemberKeyTable = {};
    const blockMemberKeyCache = storage.blockMemberKeyCache;

    for (const blockMember of blockMemberList) {
        blockMemberKeyTable[blockMember] =
            blockMemberKeyCache[blockMember] || await getMemberKeyByMemberId(blockMember);
    }

    chrome.storage.local.set({ blockMemberKeyCache: blockMemberKeyTable });

    return Object.values(blockMemberKeyTable);
}

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

export async function blockArticlesInArticleList(boardType) {
    const blockMemberKeyList = await getBlockMemberKeyList();

    for (const blockMemberKey of blockMemberKeyList) {
        const articleElementList = [...document.querySelectorAll(`a[onclick*="${blockMemberKey}"]`)];
        articleElementList.forEach((targetArticle, index) => {
            articleElementList[index] = targetArticle.closest('li,tr:not(:is(li,td) tr)');
        });

        if (boardType === 'L') {
            for (const articleElement of articleElementList) {
                const href = articleElement.querySelector('a[href*="/ArticleRead.nhn"]').href;

                articleElement.innerHTML =
                    `<td colspan="5" style="color: #676767;">
                        <a href="${href}">차단한 멤버의 게시글입니다.</a>
                    </td>`;
            }
        }
        else if (boardType === 'C') {
            for (const articleElement of articleElementList) {
                const href = articleElement.querySelector('a[href*="/ArticleRead.nhn"]').href;

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
}

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