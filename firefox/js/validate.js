import { getArticleList, getCafeMemberInfo, getCommentListRecent } from './misc/cafe-apis.js';
import { getVue, getPropertyOfVue, callMethodOfVue } from './misc/vue-delegator.js';

// 게시판별 최대 게시글 개수와 최대 댓글 개수를 정의합니다.
const limits = {
    1: {
        // 자유게시판
        articleLimit: 1,
        commentLimit: 3,
    },
    122: {
        // 유머, 정보 게시판
        articleLimit: 2,
    },
    132: {
        // 패션 게시판
        commentLimit: 2,
    },
    327: {
        // 이세돌 자유게시판
        articleLimit: 1,
        commentLimit: 3,
    },
};

/**
 * 게시글을 등록할 수 있는지 확인합니다.
 * @returns {Promise<boolean>} 등록할 수 있다면 true, 아니면 false
 */
async function validateArticle() {
    const articleWriteVue = await getVue('.ArticleWrite');

    // 현재 선택한 게시판과 말머리 아이디를 가져옵니다.
    const menuId = await getPropertyOfVue(articleWriteVue, 'article', 'menuId');
    const headId = await getPropertyOfVue(articleWriteVue, 'article', 'headId');

    const useHead = document.querySelector('.column_category .select_option li');

    // 말머리 사용 게시판에서 말머리를 선택하지 않은 경우
    if (useHead && !headId) {
        return !!alert('말머리를 선택하세요.');
    }

    const articleLimit = limits[menuId]?.articleLimit;

    // 페이지당 최대 게시글 개수 제한이 존재하는 경우
    if (articleLimit) {
        // 현재 게시판의 최근 15개 게시글을 가져옵니다.
        const articleList = await getArticleList(menuId, '1', '15');

        // 자신의 아이디를 가져옵니다.
        const cafeMemberInfo = await getCafeMemberInfo();
        const memberId = cafeMemberInfo.memberId;

        // 최근 15개 게시글 중 자신이 작성한 게시글 개수를 구합니다.
        const articleCount = articleList.filter(article => article.writerId === memberId).length;

        // 페이지당 최대 게시글 개수를 초과한 경우
        if (articleCount >= articleLimit) {
            return confirm([
                '페이지당 최대 게시글 개수를 초과하였습니다.',
                '게시글을 등록하시겠습니까?',
            ].join('\n'));
        }
    }

    return true;
}

/**
 * 댓글을 등록할 수 있는지 확인합니다.
 * @returns {Promise<boolean>} 등록할 수 있다면 true, 아니면 false
 */
async function validateComment() {
    const articleVue = await getVue('.Article');

    // 현재 읽고 있는 게시글 아이디와 게시판 아이디를 가져옵니다.
    const articleId = await getPropertyOfVue(articleVue, 'articleId');
    const menuId = await getPropertyOfVue(articleVue, 'menuId');

    const commentLimit = limits[menuId]?.commentLimit;

    // 게시글당 최대 댓글 개수 제한이 존재하는 경우
    if (commentLimit) {
        // 원래는 전체 댓글을 가져와야 합니다.
        // 하지만 댓글이 많은 게시글의 경우 시간이 너무 오래 걸리기 때문에
        // 최근 한 페이지의 댓글만 가져오도록 구현했습니다.
        const commentList = await getCommentListRecent(articleId, 1);

        // 자신의 아이디를 가져옵니다.
        // getCafeMemberInfo 함수를 사용해도 되지만, 이렇게 가져오는 것이 더 빠릅니다. 
        const commentWriterVue = await getVue('.CommentWriter');
        const memberId = await getPropertyOfVue(commentWriterVue, 'userId');

        // 최근 한 페이지의 댓글 중 자신이 작성한 댓글 개수를 구합니다.
        const commentCount = commentList.filter(comment => comment.writer.id === memberId).length;

        // 게시글당 최대 댓글 개수를 초과한 경우
        if (commentCount >= commentLimit) {
            return confirm([
                '게시글당 최대 댓글 개수를 초과하였습니다.',
                '댓글을 등록하시겠습니까?',
            ].join('\n'));
        }
    }

    return true;
}

/**
 * 게시글 등록 가능 여부 확인 과정을 추가합니다.
 */
export function addArticleValidation() {
    // 필요한 DOM 객체들이 생성될 때까지 대기합니다.
    const observer = new MutationObserver(async () => {
        const articleWrite = document.querySelector('.ArticleWrite');
        const registerButton = document.querySelector('a.BaseButton');

        if (articleWrite && registerButton) {
            observer.disconnect();

            const articleWriteVue = await getVue('.ArticleWrite');
            const registerButtonVue = await getVue('a.BaseButton');

            // 게시글 등록 버튼의 기존 클릭 이벤트 핸들러를 제거합니다.
            await callMethodOfVue(registerButtonVue, '$off');

            // 새로운 클릭 이벤트 핸들러를 등록합니다.
            registerButton.addEventListener('click', async () => {
                // 1. 기존 게시글 유효성 검사 루틴을 호출합니다. (게시판 선택 여부, 제목 유무, 내용 유무 등)
                // 2. 새로운 게시글 유효성 검사 루틴을 호출합니다. (말머리 선택 여부, 페이지당 최대 게시글 개수 초과 여부 등)
                // 3. 문제점이 발견되지 않았다면 게시글을 등록합니다.
                if (await callMethodOfVue(articleWriteVue, 'validateBeforeSubmit') && await validateArticle()) {
                    callMethodOfVue(articleWriteVue, 'clickUploadArticle');
                }
            });
        }
    });

    observer.observe(document.body, {
        childList: true,
    });
}

/**
 * 댓글 등록 가능 여부 확인 과정을 추가합니다.
 */
export function addCommentValidation() {
    // 필요한 DOM 객체들이 생성될 때까지 대기합니다.
    const observer = new MutationObserver(async () => {
        const commentWriter = document.querySelector('.CommentWriter');
        const registerButton = document.querySelector('.btn_register');

        if (commentWriter && registerButton) {
            observer.disconnect();

            const commentWriterVue = await getVue('.CommentWriter');

            // 댓글 등록 버튼의 부모 요소에 클릭 이벤트 핸들러를 등록합니다.
            registerButton.parentElement.addEventListener('click', async () => {
                // 1. 기존 댓글 유효성 검사 루틴을 호출합니다. (댓글 내용 유무 등)
                // 1-1. 댓글 내용이 비어 있다면 내용 입력을 요청하는 알림을 표시한 뒤, 댓글 입력 영역에 포커스를 맞춥니다.
                //      게시글 등록의 경우 알림을 표시하는 등의 작업이 모두 유효성 검사 루틴에 포함되어 있지만,
                //      댓글 등록의 경우 알림을 표시하는 등의 작업이 유효성 검사 루틴이 아닌 댓글 등록 루틴에 포함되어 있어
                //      동일한 작업을 클릭 이벤트 핸들러에서 직접 다시 구현해 주었습니다.
                // 2. 새로운 댓글 유효성 검사 루틴을 호출합니다. (게시글당 최대 댓글 개수 초과 여부 등)
                // 3. 문제점이 발견되지 않았다면 댓글을 등록합니다.
                if (await callMethodOfVue(commentWriterVue, 'canSubmit')) {
                    if (await validateComment()) {
                        callMethodOfVue(commentWriterVue, 'submit');
                    }
                }
                else {
                    alert('내용을 입력해주세요');
                    callMethodOfVue(commentWriterVue, ['$refs', 'inputArea', 'focus']);
                }
            }, true);

            // 댓글 등록 버튼으로 가는 클릭 이벤트를 가로챕니다.
            // 이렇게 하면 댓글 등록 버튼의 부모 요소 클릭 이벤트 핸들러가 호출된 뒤,
            // 댓글 등록 버튼 자체의 클릭 이벤트 핸들러는 호출되지 않습니다.
            // 댓글 등록 버튼의 클릭 이벤트 핸들러를 제거할 마땅한 방법이 없어 이렇게 구현했습니다.
            registerButton.parentElement.addEventListener('click', event => {
                event.stopPropagation();
            }, true);
        }
    });

    observer.observe(document.body, {
        childList: true,
    });
}