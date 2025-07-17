import * as PredicateFilter from './PredicateFilter';
import * as Selectors from './Selectors';
const all = (selector) => Selectors.all(selector);
// For all of the following:
//
// jQuery does siblings of firstChild. IE9+ supports scope.dom.children (similar to Traverse.children but elements only).
// Traverse should also do this (but probably not by default).
//
const ancestors = (scope, selector, isRoot) => 
// It may surprise you to learn this is exactly what JQuery does
// TODO: Avoid all this wrapping and unwrapping
PredicateFilter.ancestors(scope, (e) => Selectors.is(e, selector), isRoot);
const siblings = (scope, selector) => 
// It may surprise you to learn this is exactly what JQuery does
// TODO: Avoid all the wrapping and unwrapping
PredicateFilter.siblings(scope, (e) => Selectors.is(e, selector));
const children = (scope, selector) => 
// It may surprise you to learn this is exactly what JQuery does
// TODO: Avoid all the wrapping and unwrapping
PredicateFilter.children(scope, (e) => Selectors.is(e, selector));
const descendants = (scope, selector) => Selectors.all(selector, scope);
export { all, ancestors, siblings, children, descendants };
//# sourceMappingURL=SelectorFilter.js.map