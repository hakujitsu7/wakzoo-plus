(async () => {
    const src = chrome.extension.getURL('js/main.js');
    const main = await import(src);

    await main.main();
})();