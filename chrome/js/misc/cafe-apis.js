/**
 * 쿠키와 함께 요청을 보냅니다.
 * @param {string} url 요청을 보낼 URL
 * @return {Promise<any>} 응답
 */
 async function fetchWithCredentials(url) {
    return await fetch(url, { credentials: 'include' });
}

/**
 * 게시글의 내용을 가져옵니다.
 * @param {string|number} articleId 게시글 아이디
 * @returns {Promise<object>} 게시글의 내용
 */
export async function getArticle(articleId) {
    const response = await fetchWithCredentials(`https://apis.naver.com/cafe-web/cafe-articleapi/v2/cafes/27842958/articles/${articleId}`);
    const json = await response.json();

    return json.result.article;
}

/**
 * 게시글 목록을 가져옵니다.
 * @param {string|number} menuId 게시판 아이디 (비우면 전체 게시판)
 * @param {string|number} page 페이지
 * @param {string|number} perPage 한 페이지당 게시글 개수
 * @returns {Promise<object>} 게시글 목록
 */
export async function getArticleList(menuId, page, perPage) {
    const response = await fetchWithCredentials(`https://apis.naver.com/cafe-web/cafe2/ArticleList.json?search.clubid=27842958&search.menuid=${menuId}&search.page=${page}&search.perPage=${perPage}`);
    const json = await response.json();

    return json.message.result.articleList;
}

/**
 * 게시글 검색 목록을 가져옵니다.
 * @param {string|number} menuId 게시판 아이디 (비우면 전체 게시판)
 * @param {string|number} page 페이지
 * @param {string|number} perPage 한 페이지당 게시글 개수
 * @param {string} query 검색어
 * @param {string|number} searchBy 검색 기준 (0: 게시글, 1: 제목, 3: 글 작성자, 4: 댓글 내용, 5: 댓글 작성자)
 * @param {string} sortBy 정렬 기준 (date: 최신순, sim: 정확도순)
 * @returns {Promise<object>} 게시글 검색 목록
 */
export async function getArticleSearchList(menuId, page, perPage, query, searchBy, sortBy) {
    const response = await fetchWithCredentials(`https://apis.naver.com/cafe-web/cafe-mobile/CafeMobileWebArticleSearchListV3?cafeId=27842958&menuId=${menuId}&query=${query}&searchBy=${searchBy}&sortBy=${sortBy}&page=${page}&perPage=${perPage}&adUnit=MW_CAFE_BOARD`);
    const json = await response.json();

    return json.message.result.articleList;
}

/**
 * 베스트 게시글 목록을 가져옵니다.
 * @param {string} type 종류 (comment: 댓글, likeIt: 좋아요)
 * @param {string} period 기간 (week: 일주일, month: 한 달, whole: 전체)
 * @returns {Promise<object>} 베스트 게시글 목록
 */
export async function getBestArticleList(type, period) {
    const response = await fetchWithCredentials(`https://apis.naver.com/cafe-web/cafe2/BestArticleListV2.json?cafeId=27842958&type=${type}&period=${period}&adUnit=MW_CAFE_BOARD`);
    const json = await response.json();

    return json.message.result.articleList;
}

/**
 * 차단 멤버 목록을 가져옵니다.
 * @returns {Promise<object>} 차단 멤버 목록
 */
export async function getBlockMemberList() {
    const response = await fetchWithCredentials('https://apis.naver.com/cafe-web/cafe-cafeinfo-api/v1.0/cafes/27842958/block-members');
    const json = await response.json();

    return json.result;
}

/**
 * 작성 글 목록을 가져옵니다.
 * @param {string} memberId 멤버 아이디
 * @param {string|number} page 페이지
 * @param {string|number} perPage 페이지당 게시글 개수
 * @returns {Promise<object>} 작성 글 목록
 */
export async function getCafeMemberArticleList(memberId, page, perPage) {
    const memberKey = await getMemberKeyByMemberId(memberId);

    const response = await fetchWithCredentials(`https://apis.naver.com/cafe-web/cafe-mobile/CafeMemberNetworkArticleList?search.cafeId=27842958&search.memberKey=${memberKey}&search.perPage=${perPage}&search.page=${page}`);
    const json = await response.json();

    return json.message.result.articleList;
}

/**
 * 댓글 단 글 목록을 가져옵니다.
 * @param {string} memberId 멤버 아이디
 * @param {string|number} page 페이지
 * @param {string|number} perPage 페이지당 게시글 개수
 * @returns {Promise<object>} 댓글 단 글 목록
 */
export async function getCafeMemberCommentList(memberId, page, perPage) {
    const memberKey = await getMemberKeyByMemberId(memberId);

    const response = await fetchWithCredentials(`https://apis.naver.com/cafe-web/cafe-mobile/CafeMemberNetworkReplyList?search.clubid=27842958&search.memberKey=${memberKey}&search.perPage=${perPage}&search.page=${page}`);
    const json = await response.json();

    return json.message.result.articleList;
}

/**
 * 좋아요한 글 목록을 가져옵니다.
 * @param {string} memberId 멤버 아이디
 * @param {string|number} perPage 페이지당 게시글 개수
 * @param {string|number} likeItTimestamp 검색 시작 타임스탬프
 * @returns {Promise<object>} 좋아요한 글 목록
 */
export async function getCafeMemberLikeItList(memberId, perPage, likeItTimestamp) {
    const response = await fetchWithCredentials(`https://apis.naver.com/cafe-web/cafe-mobile/CafeMemberLikeItListPC?search.cafeId=27842958&search.memberId=${memberId}&search.perPage=${perPage}&search.likeItTimestamp=${likeItTimestamp}`);
    const json = await response.json();

    return {
        likeItCount: json.message.result.totalCount,
        likeItList: json.message.result.list,
        lastlikeItTimestamp: json.message.result.list[json.message.result.list.length - 1].likeItTimestamp,
    };
}

/**
 * 자신의 멤버 정보를 가져옵니다. (아이디, 닉네임, 가입 여부 등)
 * @returns {Promise<object>} 멤버 정보
 */
export async function getCafeMemberInfo() {
    const response = await fetchWithCredentials('https://apis.naver.com/cafe-web/cafe2/CafeMemberInfo.json?cafeId=27842958');
    const json = await response.json();

    return json.message.result;
}

/**
 * 멤버 프로필을 가져옵니다. (방문 수, 작성 글, 작성 댓글 등)
 * @param {string} memberId 멤버 아이디
 * @returns {Promise<object>} 멤버 프로필
 */
export async function getCafeMemberProfile(memberId) {
    const response = await fetchWithCredentials(`https://apis.naver.com/cafe-web/cafe-mobile/CafeMemberProfile?cafeId=27842958&memberId=${memberId}`);
    const json = await response.json();

    return json.message.result;
}

/**
 * 멤버 상태를 가져옵니다. (활동 정지 여부, 강제 탈퇴 여부 등)
 * @param {string} memberId 멤버 아이디
 * @returns {Promise<object>} 멤버 상태
 */
export async function getCafeMemberStatus(memberId) {
    const response = await fetchWithCredentials(`https://apis.naver.com/cafe-web/cafe-mobile/CafeMemberStatus?cafeId=27842958&memberId=${memberId}`);
    const json = await response.json();

    return json.message.result;
}

/**
 * 게시글의 댓글 목록을 가져옵니다.
 * @param {string|number} articleId 게시글 아이디 
 * @param {string|number} page 페이지
 * @returns {Promise<object>} 댓글 목록
 */
export async function getCommentList(articleId, page) {
    const response = await fetchWithCredentials(`https://apis.naver.com/cafe-web/cafe-articleapi/cafes/27842958/articles/${articleId}/comments/pages/${page}`);
    const json = await response.json();

    return {
        commentCount: json.displayCommentCount,
        commentList: json.comments.items,
    };
}

/**
 * 게시글의 모든 댓글 목록을 가져옵니다.
 * @param {string|number} articleId 게시글 아이디
 * @returns {Promise<object>} 모든 댓글 목록
 */
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

/**
 * 게시글의 최근 댓글 목록을 가져옵니다.
 * @param {string|number} articleId 게시글 아이디
 * @param {number} recentPageCount 가져올 최대 페이지 수
 * @returns {Promise<object>} 최근 댓글 목록
 */
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

/**
 * 멤버 키로부터 아이디를 가져옵니다.
 * @param {string} memberKey 멤버 키
 * @returns {Promise<string>} 멤버 아이디
 */
export async function getMemberIdByMemberKey(memberKey) {
    const response = await fetchWithCredentials(`https://apis.naver.com/cafe-web/cafe-mobile/CafeMemberProfile?cafeId=27842958&memberKey=${memberKey}`);
    const json = await response.json();

    return json.message.result.memberId;
}

/**
 * 멤버 닉네임으로부터 아이디를 가져옵니다.
 * @param {string} nickname 멤버 닉네임
 * @returns {Promise<string>} 멤버 아이디
 */
export async function getMemberIdByNickname(nickname) {
    const response = await fetchWithCredentials(`https://apis.naver.com/cafe-web/cafe-talk/v3/categories/27842958/members?query=${nickname}`);
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

/**
 * 멤버 아이디로부터 키를 가져옵니다.
 * @param {string} memberId 멤버 아이디
 * @returns {Promise<string>} 멤버 키
 */
export async function getMemberKeyByMemberId(memberId) {
    const cafeMemberProfile = await getCafeMemberProfile(memberId);

    return cafeMemberProfile.memberKey;
}

/**
 * 멤버 아이디로부터 닉네임을 가져옵니다.
 * @param {string} memberId 멤버 아이디
 * @returns {Promise<string>} 멤버 닉네임
 */
export async function getNicknameByMemberId(memberId) {
    const cafeMemberProfile = await getCafeMemberProfile(memberId);

    return cafeMemberProfile.nickName;
}

/**
 * 게시판 목록을 가져옵니다.
 * @returns {Promise<object>} 게시판 목록
 */
export async function getMenuList() {
    const response = await fetchWithCredentials('https://apis.naver.com/cafe-web/cafe-cafeinfo-api/v1.0/cafes/27842958/editor/menus');
    const json = await response.json();

    return json.result;
}

/**
 * 인기글 목록을 가져옵니다.
 * @returns {Promise<object>} 인기글 목록
 */
export async function getPopularArticleList() {
    const response = await fetchWithCredentials('https://apis.naver.com/cafe-web/cafe2/WeeklyPopularArticleList.json?cafeId=27842958');
    const json = await response.json();

    return json.message.result.popularArticleList;
}