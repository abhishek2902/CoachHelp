import { SugarElement } from '../api/node/SugarElement';
declare const supports: (element: SugarElement<Node>) => element is SugarElement<Element>;
declare const get: (element: SugarElement<Element>) => string[];
declare const add: (element: SugarElement<Element>, clazz: string) => boolean;
declare const remove: (element: SugarElement<Element>, clazz: string) => boolean;
declare const toggle: (element: SugarElement<Element>, clazz: string) => boolean;
export { get, add, remove, toggle, supports };
//# sourceMappingURL=ClassList.d.ts.map