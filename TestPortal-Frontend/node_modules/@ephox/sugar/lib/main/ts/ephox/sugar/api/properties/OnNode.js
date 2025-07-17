import * as Class from './Class';
import * as Classes from './Classes';
const addClass = (clazz) => (element) => {
    Class.add(element, clazz);
};
const removeClass = (clazz) => (element) => {
    Class.remove(element, clazz);
};
const removeClasses = (classes) => (element) => {
    Classes.remove(element, classes);
};
const hasClass = (clazz) => (element) => Class.has(element, clazz);
export { addClass, removeClass, removeClasses, hasClass };
//# sourceMappingURL=OnNode.js.map