import cp949Table from './cp949-table.js';

export function cp949ToUtf8(encodedURIComponent) {
    const characters = encodedURIComponent.match(/%\w{2}|./g);
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