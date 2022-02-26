(async () => {
    const url = chrome.extension.getURL('js/main.js');
    const main = await import(url);

    await main.main();
})();