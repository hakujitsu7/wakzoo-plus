/**
 * 페이지 내의 Vue.js 데이터에 접근하기 위해 델리게이터를 설치합니다.  
 * 델리게이터 설치가 필요한 자세한 이유에 대해서는 다음 링크를 참조하시기 바랍니다.
 * (https://stackoverflow.com/a/9517879)
 */
export function installVueDelegator() {
    if (!document.querySelector('script#WakzooPlus-VueDelegator')) {
        const script = document.createElement('script');

        script.id = 'WakzooPlus-VueDelegator';
        script.src = browser.runtime.getURL('js/misc/vue-delegator-page-context.js');;

        document.body.appendChild(script);
    }
}

/**
 * 한 번만 호출되는 이벤트 리스너를 추가합니다.
 * @param {string} type 이벤트 타입
 * @param {EventListenerOrEventListenerObject} listener 이벤트 리스너
 */
function addOnetimeEventListener(type, listener) {
    addEventListener(type, listener, { once: true });
}

/**
 * Vue 객체 아이디를 가져옵니다.
 * @param {string} selector CSS 선택자
 * @returns {Promise<number>} Vue 객체 아이디
 */
export function getVue(selector) {
    return new Promise(resolve => {
        addOnetimeEventListener('VueDelegator-GetVue-Response', event => {
            resolve(event.detail);
        });
        dispatchEvent(new CustomEvent('VueDelegator-GetVue', {
            detail: selector
        }));
    });
}

/**
 * Vue 객체의 프로퍼티 값을 가져옵니다.
 * @param {number} vueId Vue 객체 아이디
 * @param  {...string} path 가져올 프로퍼티 경로
 * @returns {Promise<any>} 프로퍼티 값
 */
export function getPropertyOfVue(vueId, ...path) {
    return new Promise(resolve => {
        addOnetimeEventListener('VueDelegator-GetPropertyOfVue-Response', event => {
            resolve(JSON.parse(event.detail));
        });
        dispatchEvent(new CustomEvent('VueDelegator-GetPropertyOfVue', {
            detail: JSON.stringify({
                vueId: vueId,
                path: path,
            })
        }));
    });
}

/**
 * Vue 객체의 메서드를 호출합니다.
 * @param {number} vueId Vue 객체 아이디
 * @param {string|string[]} path 호출할 메서드 경로
 * @param {any[]} [arg = []] 호출 인자 목록
 * @returns {Promise<any>} 반환 값
 */
export function callMethodOfVue(vueId, path, args = []) {
    let method;

    if (typeof path === 'string') {
        method = path;
        path = [];
    }
    else {
        method = path.pop();
    }

    return new Promise(resolve => {
        addOnetimeEventListener('VueDelegator-CallMethodOfVue-Response', event => {
            resolve(JSON.parse(event.detail));
        });
        dispatchEvent(new CustomEvent('VueDelegator-CallMethodOfVue', {
            detail: JSON.stringify({
                vueId: vueId,
                path: path,
                method: method,
                args: args,
            })
        }));
    });
}