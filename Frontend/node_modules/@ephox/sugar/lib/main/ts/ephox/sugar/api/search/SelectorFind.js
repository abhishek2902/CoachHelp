import ClosestOrAncestor from '../../impl/ClosestOrAncestor';
import * as PredicateFind from './PredicateFind';
import * as Selectors from './Selectors';
// TODO: An internal SelectorFilter module that doesn't SugarElement.fromDom() everything
const first = (selector) => Selectors.one(selector);
const ancestor = (scope, selector, isRoot) => PredicateFind.ancestor(scope, (e) => Selectors.is(e, selector), isRoot);
const sibling = (scope, selector) => PredicateFind.sibling(scope, (e) => Selectors.is(e, selector));
const child = (scope, selector) => PredicateFind.child(scope, (e) => Selectors.is(e, selector));
const descendant = (scope, selector) => Selectors.one(selector, scope);
// Returns Some(closest ancestor element (sugared)) matching 'selector' up to isRoot, or None() otherwise
const closest = (scope, selector, isRoot) => {
    const is = (element, selector) => Selectors.is(element, selector);
    return ClosestOrAncestor(is, ancestor, scope, selector, isRoot);
};
export { first, ancestor, sibling, child, descendant, closest };
//# sourceMappingURL=SelectorFind.js.map