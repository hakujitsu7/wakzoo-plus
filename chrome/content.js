(async () => {
    const src = chrome.runtime.getURL('js/main.js');
    const main = await import(src);

    main.main();
})();