function addOnetimeEventListener(type, listener) {
    addEventListener(type, listener, { once: true });
}

export function installVueDelegator() {
    if (!document.querySelector('script#WakzooPlus-VueDelegator')) {
        const script = document.createElement('script');

        script.id = 'WakzooPlus-VueDelegator';
        script.textContent =
            `(function () {
                function uuid() {
                    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                        return v.toString(16);
                    });
                }

                const vues = {};

                addEventListener('VueDelegator-GetVue', event => {
                    const vueId = uuid();

                    vues[vueId] = event.detail.__vue__;

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
                    catch (error) {
                        value = error.toString();
                    }

                    dispatchEvent(new CustomEvent('VueDelegator-GetPropertyOfVue-Response', {
                        detail: value
                    }));
                });

                addEventListener('VueDelegator-CallMethodOfVue', event => {
                    const detail = JSON.parse(event.detail);

                    let value = vues[detail.vueId];

                    for (const name of detail.path) {
                        if (!value) {
                            break;
                        }
                        value = value[name];
                    }

                    let result = undefined;

                    if (typeof value[detail.method] === 'function') {
                        result = value[detail.method](...detail.args);
                    }

                    try {
                        result = JSON.stringify(result);
                    }
                    catch (error) {
                        result = JSON.stringify(error.toString());
                    }

                    dispatchEvent(new CustomEvent('VueDelegator-CallMethodOfVue-Response', {
                        detail: result
                    }));
                });
            })();`;

        document.body.appendChild(script);
    }
}

export function getVue(element) {
    return new Promise(resolve => {
        addOnetimeEventListener('VueDelegator-GetVue-Response', event => {
            resolve(event.detail);
        });
        dispatchEvent(new CustomEvent('VueDelegator-GetVue', {
            detail: element
        }));
    });
}

export function getPropertyOfVue(vue, ...path) {
    return new Promise(resolve => {
        addOnetimeEventListener('VueDelegator-GetPropertyOfVue-Response', event => {
            resolve(JSON.parse(event.detail));
        });
        dispatchEvent(new CustomEvent('VueDelegator-GetPropertyOfVue', {
            detail: JSON.stringify({
                vueId: vue,
                path: path,
            })
        }));
    });
}

export function callMethodOfVue(vue, path, args = []) {
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
                vueId: vue,
                path: path,
                method: method,
                args: args,
            })
        }));
    });
}