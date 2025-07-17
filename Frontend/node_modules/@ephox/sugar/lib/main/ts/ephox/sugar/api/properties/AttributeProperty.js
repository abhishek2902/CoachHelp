import * as Attribute from './Attribute';
export const AttributeProperty = (attribute, value) => {
    const is = (element) => Attribute.get(element, attribute) === value;
    const remove = (element) => Attribute.remove(element, attribute);
    const set = (element) => Attribute.set(element, attribute, value);
    return {
        is,
        remove,
        set
    };
};
//# sourceMappingURL=AttributeProperty.js.map