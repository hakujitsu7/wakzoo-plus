/**
 * 페이지 콘텍스트에서 작동하는 델리게이터 코드입니다.
 * 확장 프로그램이 페이지 내에 존재하는 Vue.js 데이터에 접근할 수 있도록 해 줍니다.
 */
(function () {
    const vues = [];

    addEventListener('VueDelegator-GetVue', event => {
        const vue = document.querySelector(event.detail)?.__vue__;
        let vueId = undefined;

        vueId = vues.indexOf(vue);

        if (vue && vueId < 0) {
            vueId = vues.length;
            vues[vueId] = vue;
        }

        dispatchEvent(new CustomEvent('VueDelegator-GetVue-Response', {
            detail: vueId
        }));
    });

    addEventListener('VueDelegator-GetPropertyOfVue', event => {
        const detail = JSON.parse(event.detail);

        let value = vues[detail.vueId];

        for (const name of detail.path) {
            if (!value) {
                break;
            }
            value = value[name];
        }

        try {
            value = JSON.stringify(value);
        }
        catch {
            value = undefined;
        }

        dispatchEvent(new CustomEvent('VueDelegator-GetPropertyOfVue-Response', {
            detail: value
        }));
    });

    addEventListener('VueDelegator-CallMethodOfVue', event => {
        const detail = JSON.parse(event.detail);

        let value = vues[detail.vueId];
        let result = undefined;

        for (const name of detail.path) {
            if (!value) {
                break;
            }
            value = value[name];
        }

        if (typeof value[detail.method] === 'function') {
            result = value[detail.method](...detail.args);
        }

        try {
            result = JSON.stringify(result);
        }
        catch {
            result = undefined;
        }

        dispatchEvent(new CustomEvent('VueDelegator-CallMethodOfVue-Response', {
            detail: result
        }));
    });
})();