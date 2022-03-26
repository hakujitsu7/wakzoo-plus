export function installVueDelegator() {
    if (!document.querySelector('script#WakzooPlus-VueDelegator')) {
        const script = document.createElement('script');

        script.id = 'WakzooPlus-VueDelegator';
        script.src = chrome.runtime.getURL('js/misc/vue-delegator-page-context.js');;

        document.body.appendChild(script);
    }
}

function addOnetimeEventListener(type, listener) {
    addEventListener(type, listener, { once: true });
}

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