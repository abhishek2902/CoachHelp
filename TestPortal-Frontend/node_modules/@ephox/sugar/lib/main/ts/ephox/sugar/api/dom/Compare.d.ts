import { SugarElement } from '../node/SugarElement';
declare const eq: (e1: SugarElement<unknown>, e2: SugarElement<unknown>) => boolean;
declare const isEqualNode: (e1: SugarElement<Node>, e2: SugarElement<Node>) => boolean;
declare const member: (element: SugarElement<unknown>, elements: SugarElement<unknown>[]) => boolean;
declare const contains: (e1: SugarElement<Node>, e2: SugarElement<Node>) => boolean;
declare const is: <T extends Element = Element>(element: SugarElement<Node>, selector: string) => element is SugarElement<T>;
export { eq, isEqualNode, member, contains, is };
//# sourceMappingURL=Compare.d.ts.map