import cp949Table from './cp949-table.js';

/**
 * URL 디코드를 시도합니다.
 * @param {string} encodedURIComponent 인코드된 URL
 * @returns {string} 성공하면 디코드된 URL, 실패하면 디코드되지 않은 URL
 */
export function tryDecodeURIComponent(encodedURIComponent) {
    try {
        return decodeURIComponent(encodedURIComponent);
    }
    catch {
        return encodedURIComponent;
    }
}

/**
 * URL 쿼리 파라미터를 가져옵니다. (파라미터 이름을 모두 소문자로 변경하는 것에 유의합니다.)
 * @param {string} [search = null] 쿼리 스트링
 * @returns {object} 쿼리 파라미터 객체
 */
export function getUrlSearchParams(search = null) {
    const urlSearchParams = new URLSearchParams(search || location.search);

    const urlSearchParamsObject = {}

    for (const [key, value] of urlSearchParams.entries()) {
        urlSearchParamsObject[key.toLowerCase()] = tryDecodeURIComponent(value);
    }

    return urlSearchParamsObject;
}

/**
 * CP949 인코드된 URL을 UTF-8 인코드된 URL로 변환합니다.
 * @param {string} cp949EncodedURIComponent CP949 인코드된 URL
 * @returns UTF-8 인코드된 URL
 */
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

/**
 * 현재 URL의 CP949 인코드된 쿼리 파라미터들을 UTF-8 인코드로 변환합니다.
 * @param {...string} cp949Params CP949 인코드된 쿼리 파라미터 이름 목록
 * @returns {string} UTF-8 인코드된 쿼리 스트링
 */
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