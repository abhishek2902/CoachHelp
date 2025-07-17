const isEdge = (platform) => {
    return platform.browser.isEdge();
};
const isChromium = (platform) => {
    return platform.browser.isChromium();
};
const isFirefox = (platform) => {
    return platform.browser.isFirefox();
};
const isIE11 = (platform) => {
    return isIE(platform) && platform.browser.version.major === 11;
};
const isIE = (platform) => {
    return platform.browser.isIE();
};
const isSafari = (platform) => {
    return platform.browser.isSafari();
};
const isOpera = (platform) => {
    return platform.browser.isOpera();
};
export { isEdge, isChromium, isFirefox, isOpera, isIE11, isIE, isSafari };
//# sourceMappingURL=PlatformQuery.js.map