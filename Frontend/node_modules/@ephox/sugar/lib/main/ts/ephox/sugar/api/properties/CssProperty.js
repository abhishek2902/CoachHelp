import * as Css from './Css';
export const CssProperty = (property, value) => {
    const is = (element) => Css.get(element, property) === value;
    const remove = (element) => Css.remove(element, property);
    const set = (element) => Css.set(element, property, value);
    return {
        is,
        remove,
        set
    };
};
//# sourceMappingURL=CssProperty.js.map