import * as FilteredEvent from '../../impl/FilteredEvent';
// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
const isLeftClick = (raw) => raw.button === 0;
// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
const isLeftButtonPressed = (raw) => {
    // Only added by Chrome/Firefox in June 2015.
    // This is only to fix a 1px bug (TBIO-2836) so return true if we're on an older browser
    if (raw.buttons === undefined) {
        return true;
    }
    // use bitwise & for optimal comparison
    // eslint-disable-next-line no-bitwise
    return (raw.buttons & 1) !== 0;
};
// Not 100% sure whether this works, so use with caution
const isRealClick = (raw) => {
    // standards, only gecko/webkit as of Sept 2015
    // https://developer.mozilla.org/en-US/docs/Web/API/Event/isTrusted
    // fallback to yes because there's no other way to really know
    const isTrusted = raw.isTrusted !== undefined && raw.isTrusted !== true ? false : true;
    // Firefox non-standard property
    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent#mozInputSource
    const firefoxRaw = raw;
    return (firefoxRaw.mozInputSource === 6 || firefoxRaw.mozInputSource === 0) ? false : isTrusted;
};
const filtered = (event, filter) => ({
    bind: (element, f) => {
        return FilteredEvent.bind(element, event, filter, f);
    }
});
const realClick = filtered('click', isRealClick);
const leftDown = filtered('mousedown', isLeftClick);
const leftPressedOver = filtered('mouseover', isLeftButtonPressed);
const leftUp = filtered('mouseup', isLeftClick);
export { realClick, leftDown, leftPressedOver, leftUp };
//# sourceMappingURL=MouseEvents.js.map