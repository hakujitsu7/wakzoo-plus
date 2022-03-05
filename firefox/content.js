(async () => {
    const src = browser.runtime.getURL('js/main.js');
    const main = await import(src);

    main.main();
})();