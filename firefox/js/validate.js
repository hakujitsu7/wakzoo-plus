import { getArticleList, getCafeMemberInfo, getCommentListRecent } from './cafe-apis.js';
import { getVue, getPropertyOfVue, callMethodOfVue } from './vue-delegator.js';

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

export async function validateArticle() {
    const articleWriteVue = await getVue('.ArticleWrite');

    const menuId = await getPropertyOfVue(articleWriteVue, 'article', 'menuId');
    const headId = await getPropertyOfVue(articleWriteVue, 'article', 'headId');

    const useHead = document.querySelector('.column_category .select_option li');

    if (useHead && !headId) {
        return alert('말머리를 선택하세요.');
    }

    const articleLimit = limits[menuId]?.articleLimit;

    if (articleLimit) {
        const articleList = await getArticleList(menuId, '1', '15');

        const cafeMemberInfo = await getCafeMemberInfo();
        const memberId = cafeMemberInfo.memberId;

        const articleCount = articleList.filter(article => article.writerId === memberId).length;

        if (articleCount >= articleLimit) {
            return confirm([
                '페이지당 최대 게시글 개수를 초과하였습니다.',
                '게시글을 등록하시겠습니까?',
            ].join('\n'));
        }
    }

    return true;
}

export async function validateComment() {
    const articleVue = await getVue('.Article');

    const articleId = await getPropertyOfVue(articleVue, 'articleId');
    const menuId = await getPropertyOfVue(articleVue, 'menuId');

    const commentLimit = limits[menuId]?.commentLimit;

    if (commentLimit) {
        const commentList = await getCommentListRecent(articleId, 1);

        const commentWriterVue = await getVue('.CommentWriter');
        const memberId = await getPropertyOfVue(commentWriterVue, 'userId');

        const commentCount = commentList.filter(comment => comment.writer.id === memberId).length;

        if (commentCount >= commentLimit) {
            return confirm([
                '게시글당 최대 댓글 개수를 초과하였습니다.',
                '댓글을 등록하시겠습니까?',
            ].join('\n'));
        }
    }

    return true;
}

export function addArticleValidation() {
    const observer = new MutationObserver(async () => {
        const articleWrite = document.querySelector('.ArticleWrite');
        const registerButton = document.querySelector('a.BaseButton');

        if (articleWrite && registerButton) {
            observer.disconnect();

            const articleWriteVue = await getVue('.ArticleWrite');
            const registerButtonVue = await getVue('a.BaseButton');

            await callMethodOfVue(registerButtonVue, '$off');

            registerButton.addEventListener('click', async () => {
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

export function addCommentValidation() {
    const observer = new MutationObserver(async () => {
        const commentWriter = document.querySelector('.CommentWriter');
        const registerButton = document.querySelector('.btn_register');

        if (commentWriter && registerButton) {
            observer.disconnect();

            const commentWriterVue = await getVue('.CommentWriter');

            registerButton.parentElement.addEventListener('click', async () => {
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

            registerButton.parentElement.addEventListener('click', event => {
                event.stopPropagation();
            }, true);
        }
    });

    observer.observe(document.body, {
        childList: true,
    });
}