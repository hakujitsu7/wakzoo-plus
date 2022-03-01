async function fetchWithCredentials(url) {
    return await fetch(url, { credentials: 'include' });
}

export async function getArticle(articleId) {
    const response = await fetchWithCredentials(`https://apis.naver.com/cafe-web/cafe-articleapi/v2/cafes/27842958/articles/${articleId}`);
    const json = await response.json();

    return json.result.article;
}

export async function getArticleList(menuId, page, perPage) {
    const response = await fetchWithCredentials(`https://apis.naver.com/cafe-web/cafe2/ArticleList.json?search.clubid=27842958&search.menuid=${menuId}&search.page=${page}&search.perPage=${perPage}`);
    const json = await response.json();

    return json.message.result.articleList;
}

export async function getArticleListAndBlockMemberList(menuId, page, perPage) {
    const response = await fetchWithCredentials(`https://apis.naver.com/cafe-web/cafe2/ArticleList.json?search.clubid=27842958&search.menuid=${menuId}&search.page=${page}&search.perPage=${perPage}`);
    const json = await response.json();

    return {
        articleList: json.message.result.articleList,
        blockMemberList: json.message.result.blockMemberList,
    };
}

export async function getBlockMemberList() {
    const response = await fetchWithCredentials('https://apis.naver.com/cafe-web/cafe-cafeinfo-api/v1.0/cafes/27842958/block-members');
    const json = await response.json();

    return json.result;
}

export async function getCafeMemberArticleList(memberId, perPage, page) {
    const memberKey = await getMemberKeyByMemberId(memberId);

    const response = await fetchWithCredentials(`https://apis.naver.com/cafe-web/cafe-mobile/CafeMemberNetworkArticleList?search.cafeId=27842958&search.memberKey=${memberKey}&search.perPage=${perPage}&search.page=${page}`);
    const json = await response.json();

    return json.message.result.articleList;
}

export async function getCafeMemberCommentList(memberId, perPage, page) {
    const memberKey = await getMemberKeyByMemberId(memberId);

    const response = await fetchWithCredentials(`https://apis.naver.com/cafe-web/cafe-mobile/CafeMemberNetworkReplyList?search.clubid=27842958&search.memberKey=${memberKey}&search.perPage=${perPage}&search.page=${page}`);
    const json = await response.json();

    return json.message.result.articleList;
}

export async function getCafeMemberLikeItList(memberId, perPage, likeItTimestamp) {
    const response = await fetchWithCredentials(`https://apis.naver.com/cafe-web/cafe-mobile/CafeMemberLikeItListPC?search.cafeId=27842958&search.memberId=${memberId}&search.perPage=${perPage}&search.likeItTimestamp=${likeItTimestamp}`);
    const json = await response.json();

    return {
        likeItCount: json.message.result.totalCount,
        likeItList: json.message.result.list,
        lastlikeItTimestamp: json.message.result.list[json.message.result.list.length - 1].likeItTimestamp,
    };
}

export async function getCafeMemberInfo() {
    const response = await fetchWithCredentials('https://apis.naver.com/cafe-web/cafe2/CafeMemberInfo.json?cafeId=27842958');
    const json = await response.json();

    return json.message.result;
}

export async function getCafeMemberProfile(memberId) {
    const response = await fetchWithCredentials(`https://apis.naver.com/cafe-web/cafe-mobile/CafeMemberProfile?cafeId=27842958&memberId=${memberId}`);
    const json = await response.json();

    return json.message.result;
}

export async function getCafeMemberStatus(memberId) {
    const response = await fetchWithCredentials(`https://apis.naver.com/cafe-web/cafe-mobile/CafeMemberStatus?cafeId=27842958&memberId=${memberId}`);
    const json = await response.json();

    return json.message.result;
}

export async function getCommentList(articleId, page) {
    const response = await fetchWithCredentials(`https://apis.naver.com/cafe-web/cafe-articleapi/cafes/27842958/articles/${articleId}/comments/pages/${page}`);
    const json = await response.json();

    return {
        commentCount: json.displayCommentCount,
        commentList: json.comments.items,
    };
}

export async function getCommentListAll(articleId) {
    const commentList = await getCommentList(articleId, 1);

    const pageCount = Math.ceil(commentList.commentCount / 100);
    const commentListAll = commentList.commentList;

    for (let page = 2; page <= pageCount; page++) {
        const commentList = await getCommentList(articleId, page);
        commentListAll.push(...commentList.commentList);
    }

    return commentListAll;
}

export async function getCommentListRecent(articleId, recentPageCount) {
    const commentList = await getCommentList(articleId, 1);

    const pageCount = Math.ceil(commentList.commentCount / 100);
    const commentListRecent = [];

    let startPage = Math.max(pageCount - recentPageCount + 1, 1);

    if (startPage === 1) {
        commentListRecent.push(...commentList.commentList);
        startPage++;
    }

    for (let page = startPage; page <= pageCount; page++) {
        const commentList = await getCommentList(articleId, page);
        commentListRecent.push(...commentList.commentList);
    }

    return commentListRecent;
}

export async function getMemberIdByMemberKey(memberKey) {
    const response = await fetchWithCredentials(`https://apis.naver.com/cafe-web/cafe-mobile/CafeMemberProfile?cafeId=27842958&memberKey=${memberKey}`);
    const json = await response.json();

    return json.message.result.memberId;
}

export async function getMemberIdByNickname(nickname) {
    const response = await fetchWithCredentials(`https://apis.naver.com/cafe-web/cafe-talk/v3/categories/27842958/members?query=${encodeURIComponent(nickname)}`);
    const json = await response.json();

    const memberList = json.message.result.memberList.map(member => ({
        nickname: member.nickname,
        memberId: member.memberId,
    }));

    const cafeMemberInfo = await getCafeMemberInfo();
    memberList.push({
        nickname: cafeMemberInfo.nickName,
        memberId: cafeMemberInfo.memberId,
    });

    return memberList.find(member => member.nickname === nickname)?.memberId;
}

export async function getMemberKeyByMemberId(memberId) {
    const cafeMemberProfile = await getCafeMemberProfile(memberId);

    return cafeMemberProfile.memberKey;
}

export async function getNicknameByMemberId(memberId) {
    const cafeMemberProfile = await getCafeMemberProfile(memberId);

    return cafeMemberProfile.nickName;
}

export async function getMenuList() {
    const response = await fetchWithCredentials('https://apis.naver.com/cafe-web/cafe-cafeinfo-api/v1.0/cafes/27842958/editor/menus');
    const json = await response.json();

    return json.result;
}

export async function getPopularArticleList() {
    const response = await fetchWithCredentials('https://apis.naver.com/cafe-web/cafe2/WeeklyPopularArticleList.json?cafeId=27842958');
    const json = await response.json();

    return json.message.result.popularArticleList;
}