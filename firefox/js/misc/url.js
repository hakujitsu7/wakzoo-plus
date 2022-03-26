import cp949Table from './cp949-table.js';

export function tryDecodeURIComponent(encodedURIComponent) {
    try {
        return decodeURIComponent(encodedURIComponent);
    }
    catch {
        return encodedURIComponent;
    }
}

export function getUrlSearchParams(search = null) {
    const urlSearchParams = new URLSearchParams(search || location.search);

    const urlSearchParamsObject = {}

    const entries = urlSearchParams.entries();
    let entryObj = entries.next();

    while (!entryObj.done) {
        const [key, value] = entryObj.value;
        urlSearchParamsObject[key.toLowerCase()] = tryDecodeURIComponent(value);

        entryObj = entries.next();
    }

    return urlSearchParamsObject;
}

function cp949ToUtf8(cp949EncodedURIComponent) {
    const characters = cp949EncodedURIComponent.match(/%\w{2}|./g);
    const result = [];

    while (characters.length) {
        const high = characters.shift();

        if (high.length === 3) {
            if (high <= '%7F') {
                result.push(high);
            }
            else if (['%80', '%C9', '%FE', '%FF'].includes(high)) {
                result.push(high);
            }
            else {
                const low = characters.shift();

                result.push(cp949Table[`${high}${low}`] || `${high}${low}`);
            }
        }
        else {
            result.push(high);
        }
    }

    return result.join('');
}

export function cp949ToUtf8InUrlSearchParams(...cp949Params) {
    cp949Params.forEach((param, index) => {
        cp949Params[index] = param.toLowerCase();
    });

    return location.search.replace(
        /([?&])([^=]+)=([^&]*)/g,
        (match, separator, key, value) => {
            if (cp949Params.includes(key.toLowerCase())) {
                return `${separator}${key}=${cp949ToUtf8(value)}`;
            }
            else {
                return match;
            }
        }
    );
}