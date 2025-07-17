const get = (element) => element.dom.value;
const set = (element, value) => {
    if (value === undefined) {
        throw new Error('Value.set was undefined');
    }
    element.dom.value = value;
};
export { set, get };
//# sourceMappingURL=Value.js.map