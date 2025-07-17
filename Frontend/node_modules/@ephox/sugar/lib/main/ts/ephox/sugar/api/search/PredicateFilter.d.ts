import { SugarElement } from '../node/SugarElement';
declare const all: {
    <T extends Node = Node>(predicate: (e: SugarElement<Node>) => e is SugarElement<T>): SugarElement<T>[];
    (predicate: (e: SugarElement<Node>) => boolean): SugarElement<Node>[];
};
declare const ancestors: {
    <T extends Node = Node>(scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => e is SugarElement<T>, isRoot?: (e: SugarElement<Node>) => boolean): SugarElement<T>[];
    (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean, isRoot?: (e: SugarElement<Node>) => boolean): SugarElement<Node>[];
};
declare const siblings: {
    <T extends Node = Node>(scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => e is SugarElement<T>): SugarElement<T>[];
    (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean): SugarElement<Node>[];
};
declare const children: {
    <T extends Node = Node>(scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => e is SugarElement<T>): SugarElement<T>[];
    (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean): SugarElement<Node>[];
};
declare const descendants: {
    <T extends Node = Node>(scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => e is SugarElement<T>): SugarElement<T>[];
    (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean): SugarElement<Node>[];
};
export { all, ancestors, siblings, children, descendants };
//# sourceMappingURL=PredicateFilter.d.ts.map