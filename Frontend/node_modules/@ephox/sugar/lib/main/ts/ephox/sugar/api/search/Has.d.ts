import { SugarElement } from '../node/SugarElement';
declare const ancestor: (element: SugarElement<Node>, target: SugarElement<Node>) => boolean;
declare const anyAncestor: (element: SugarElement<Node>, targets: SugarElement<Node>[]) => boolean;
declare const sibling: (element: SugarElement<Node>, targets: SugarElement<Node>[]) => boolean;
declare const child: (element: SugarElement<Node>, target: SugarElement<Node>) => boolean;
declare const descendant: (element: SugarElement<Node>, target: SugarElement<Node>) => boolean;
export { ancestor, anyAncestor, sibling, child, descendant };
//# sourceMappingURL=Has.d.ts.map