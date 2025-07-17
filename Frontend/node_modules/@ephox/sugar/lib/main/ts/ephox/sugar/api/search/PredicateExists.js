import * as PredicateFind from './PredicateFind';
const any = (predicate) => PredicateFind.first(predicate).isSome();
const ancestor = (scope, predicate, isRoot) => PredicateFind.ancestor(scope, predicate, isRoot).isSome();
const closest = (scope, predicate, isRoot) => PredicateFind.closest(scope, predicate, isRoot).isSome();
const sibling = (scope, predicate) => PredicateFind.sibling(scope, predicate).isSome();
const child = (scope, predicate) => PredicateFind.child(scope, predicate).isSome();
const descendant = (scope, predicate) => PredicateFind.descendant(scope, predicate).isSome();
export { any, ancestor, closest, sibling, child, descendant };
//# sourceMappingURL=PredicateExists.js.map