import { getArticleList, getCafeMemberInfo, getCommentListRecent } from './cafe-apis.js';

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

async function validateArticle() {
    const articleWriteVue = document.querySelector('.ArticleWrite').__vue__;

    const menuId = articleWriteVue.article.menuId;
    const headId = articleWriteVue.article.headId;

    const useHead = articleWriteVue.menus.find(menu => menu.menuId === menuId).useHead;

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

async function validateComment() {
    const articleVue = document.querySelector('.Article').__vue__;

    const articleId = articleVue.articleId;
    const menuId = articleVue.menuId;

    const commentLimit = limits[menuId]?.commentLimit;

    if (commentLimit) {
        const commentList = await getCommentListRecent(articleId, 1);

        const commentWriterVue = document.querySelector('.CommentWriter').__vue__;
        const memberId = commentWriterVue.userId;

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

export async function addArticleValidation() {
    const observer = setInterval(() => {
        const articleWrite = document.querySelector('.ArticleWrite');
        const registerButton = document.querySelector('a.BaseButton');

        const articleWriteVue = articleWrite.__vue__;
        const registerButtonVue = registerButton.__vue__;

        if (articleWriteVue && registerButtonVue) {
            clearInterval(timer);

            registerButtonVue.$off();

            registerButton.addEventListener('click', async () => {
                if (articleWriteVue.validateBeforeSubmit() && await validateArticle()) {
                    articleWriteVue.clickUploadArticle();
                }
            });
        }
    }, 100);
}

export async function addCommentValidation() {
    const timer = setInterval(() => {
        const commentWriter = document.querySelector('.CommentWriter');
        const registerButton = document.querySelector('.btn_register');

        const commentWriterVue = commentWriter.__vue__;

        if (commentWriterVue && registerButton) {
            clearInterval(timer);

            registerButton.parentElement.addEventListener('click', async () => {
                console.log('%ccalled', 'color: red;');
                if (commentWriterVue.canSubmit() && await validateComment()) {
                    commentWriterVue.submit();
                }
            }, true);

            registerButton.parentElement.addEventListener('click', event => {
                event.stopPropagation();
            }, true);
        }
    }, 100);
}