const r = (left, top) => {
    const translate = (x, y) => r(left + x, top + y);
    return {
        left,
        top,
        translate
    };
};
// tslint:disable-next-line:variable-name
export const SugarPosition = r;
//# sourceMappingURL=SugarPosition.js.map