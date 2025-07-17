import * as SelectorFind from './SelectorFind';
const any = (selector) => SelectorFind.first(selector).isSome();
const ancestor = (scope, selector, isRoot) => SelectorFind.ancestor(scope, selector, isRoot).isSome();
const sibling = (scope, selector) => SelectorFind.sibling(scope, selector).isSome();
const child = (scope, selector) => SelectorFind.child(scope, selector).isSome();
const descendant = (scope, selector) => SelectorFind.descendant(scope, selector).isSome();
const closest = (scope, selector, isRoot) => SelectorFind.closest(scope, selector, isRoot).isSome();
export { any, ancestor, sibling, child, descendant, closest };
//# sourceMappingURL=SelectorExists.js.map