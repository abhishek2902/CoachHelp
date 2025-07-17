import * as SelectorFind from '../search/SelectorFind';
const set = (element, status) => {
    element.dom.checked = status;
};
const get = (element) => element.dom.checked;
// :checked selector requires IE9
// http://www.quirksmode.org/css/selectors/#t60
const find = (parent) => SelectorFind.descendant(parent, 'input:checked');
export { get, set, find };
//# sourceMappingURL=Checked.js.map