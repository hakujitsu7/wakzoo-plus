import { getBlockMemberList, getMemberKeyByMemberId } from './misc/cafe-apis.js';

/**
 * 차단한 멤버 키 리스트를 가져옵니다.
 * @returns {Promise<string[]>} 차단한 멤버 키 리스트
 */
async function getBlockMemberKeyList() {
    // 차단한 멤버 아이디 목록을 가져옵니다.
    // 이후 차단 대상 게시글을 가져오기 위해선 이 목록을 멤버 키 목록으로 변환해 줘야 합니다.
    const blockMemberList = await getBlockMemberList();

    // 시간 단축을 위해 로컬 스토리지에서 차단한 멤버 키 캐시를 가져옵니다.
    // 캐시를 사용해 서버에 멤버의 키를 질의하는 작업을 최소화합니다.
    const storage = await chrome.storage.local.get({ blockMemberKeyCache: {} });

    // blockMemberKeyTable와 blockMemberKeyCache는 다음 구조를 가집니다.
    // {
    //     <blockMemberId: string>: <blockMemberKey: string>,
    //     ...
    // }
    // blockMemberKeyTable의 키의 개수는 해당 함수 호출 시점에 차단한 멤버의 수와 같고,
    // blockMemberKeyCache의 키의 개수는 이전에 마지막으로 해당 함수를 호출했을 때 차단했던 멤버의 수와 같습니다.
    const blockMemberKeyTable = {};
    const blockMemberKeyCache = storage.blockMemberKeyCache;

    for (const blockMemberId of blockMemberList) {
        // 이미 멤버 아이디에 대응되는 멤버 키를 알고 있다면 (즉, 캐시에 멤버 키가 존재한다면)
        // 캐시에서 멤버 키를 가져옵니다.
        // 만약 캐시에서 대응되는 멤버 키를 찾지 못했다면, 서버에 멤버 키를 질의합니다.
        blockMemberKeyTable[blockMemberId] =
            blockMemberKeyCache[blockMemberId] || await getMemberKeyByMemberId(blockMemberId);
    }

    // 캐시를 최신 상태로 갱신합니다.
    chrome.storage.local.set({ blockMemberKeyCache: blockMemberKeyTable });

    return Object.values(blockMemberKeyTable);
}

/**
 * 카페 메인 화면에서 차단한 멤버의 게시글을 가립니다.
 */
export async function blockArticlesInMyCafeIntro() {
    // 차단한 멤버 키 목록을 가져옵니다.
    const blockMemberKeyList = await getBlockMemberKeyList();

    for (const blockMemberKey of blockMemberKeyList) {
        // 차단 대상 게시글을 가져옵니다.
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
    // 차단한 멤버 키 목록을 가져옵니다.
    const blockMemberKeyList = await getBlockMemberKeyList();

    for (const blockMemberKey of blockMemberKeyList) {
        // 차단 대상 게시글을 가져옵니다.
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
    // 차단한 멤버 키 목록을 가져옵니다.
    const blockMemberKeyList = await getBlockMemberKeyList();

    for (const blockMemberKey of blockMemberKeyList) {
        // 차단 대상 게시글을 가져옵니다.
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
    // 차단한 멤버 키 목록을 가져옵니다.
    const blockMemberKeyList = await getBlockMemberKeyList();

    for (const blockMemberKey of blockMemberKeyList) {
        // 차단 대상 게시글을 가져옵니다.
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