async function getArticle(articleId) {
    const response = await fetch(`https://apis.naver.com/cafe-web/cafe-articleapi/v2/cafes/27842958/articles/${articleId}`, { credentials: 'include' });
    const json = await response.json();

    return json.result.article;
}

async function getArticleList(menuId, page, perPage) {
    const response = await fetch(`https://apis.naver.com/cafe-web/cafe2/ArticleList.json?search.clubid=27842958&search.menuid=${menuId}&search.page=${page}&search.perPage=${perPage}`, { credentials: 'include' });
    const json = await response.json();

    return json.message.result.articleList;
}

async function getArticleListAndBlockMemberList(menuId, page, perPage) {
    const response = await fetch(`https://apis.naver.com/cafe-web/cafe2/ArticleList.json?search.clubid=27842958&search.menuid=${menuId}&search.page=${page}&search.perPage=${perPage}`, { credentials: 'include' });
    const json = await response.json();

    return {
        articleList: json.message.result.articleList,
        blockMemberList: json.message.result.blockMemberList,
    };
}

async function getBlockMemberList() {
    const response = await fetch('https://apis.naver.com/cafe-web/cafe-cafeinfo-api/v1.0/cafes/27842958/block-members', { credentials: 'include' });
    const json = await response.json();

    return json.result;
}

async function getCafeMemberArticleList(memberId, perPage, page) {
    const memberKey = await getMemberKeyByMemberId(memberId);

    const response = await fetch(`https://apis.naver.com/cafe-web/cafe-mobile/CafeMemberNetworkArticleList?search.cafeId=27842958&search.memberKey=${memberKey}&search.perPage=${perPage}&search.page=${page}`, { credentials: 'include' });
    const json = await response.json();

    return json.message.result.articleList;
}

async function getCafeMemberCommentList(memberId, perPage, page) {
    const memberKey = await getMemberKeyByMemberId(memberId);

    const response = await fetch(`https://apis.naver.com/cafe-web/cafe-mobile/CafeMemberNetworkReplyList?search.clubid=27842958&search.memberKey=${memberKey}&search.perPage=${perPage}&search.page=${page}`, { credentials: 'include' });
    const json = await response.json();

    return json.message.result.articleList;
}

async function getCafeMemberLikeItList(memberId, perPage, likeItTimestamp) {
    const response = await fetch(`https://apis.naver.com/cafe-web/cafe-mobile/CafeMemberLikeItListPC?search.cafeId=27842958&search.memberId=${memberId}&search.perPage=${perPage}&search.likeItTimestamp=${likeItTimestamp}`, { credentials: 'include' });
    const json = await response.json();

    return {
        likeItCount: json.message.result.totalCount,
        likeItList: json.message.result.list,
        lastlikeItTimestamp: json.message.result.list[json.message.result.list.length - 1].likeItTimestamp,
    };
}

async function getCafeMemberInfo() {
    const response = await fetch('https://apis.naver.com/cafe-web/cafe2/CafeMemberInfo.json?cafeId=27842958', { credentials: 'include' });
    const json = await response.json();

    return json.message.result;
}

async function getCafeMemberProfile(memberId) {
    const response = await fetch(`https://apis.naver.com/cafe-web/cafe-mobile/CafeMemberProfile?cafeId=27842958&memberId=${memberId}`, { credentials: 'include' });
    const json = await response.json();

    return json.message.result;
}

async function getCafeMemberStatus(memberId) {
    const response = await fetch(`https://apis.naver.com/cafe-web/cafe-mobile/CafeMemberStatus?cafeId=27842958&memberId=${memberId}`, { credentials: 'include' });
    const json = await response.json();

    return json.message.result;
}

async function getCommentList(articleId, page) {
    const response = await fetch(`https://apis.naver.com/cafe-web/cafe-articleapi/cafes/27842958/articles/${articleId}/comments/pages/${page}`, { credentials: 'include' });
    const json = await response.json();

    return {
        commentCount: json.displayCommentCount,
        commentList: json.comments.items,
    };
}

async function getCommentListAll(articleId) {
    const commentList = await getCommentList(articleId, 1);

    const pageCount = Math.ceil(commentList.commentCount / 100);
    const commentListAll = commentList.commentList;

    for (let page = 2; page <= pageCount; page++) {
        const commentList = await getCommentList(articleId, page);
        commentListAll.push(...commentList.commentList);
    }

    return commentListAll;
}

async function getMemberIdByNickname(nickname) {
    const response = await fetch(`https://apis.naver.com/cafe-web/cafe-talk/v3/categories/27842958/members?query=${encodeURIComponent(nickname)}`, { credentials: 'include' });
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

async function getMemberKeyByMemberId(memberId) {
    const cafeMemberProfile = await getCafeMemberProfile(memberId);

    return cafeMemberProfile?.memberKey;
}

async function getPopularArticleList() {
    const response = await fetch('https://apis.naver.com/cafe-web/cafe2/WeeklyPopularArticleList.json?cafeId=27842958', { credentials: 'include' });
    const json = await response.json();

    return json.message.result.popularArticleList;
}