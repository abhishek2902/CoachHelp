import { SugarElement } from '../node/SugarElement';
import { Toggler } from './Toggler';
declare const add: (element: SugarElement<Element>, clazz: string) => void;
declare const remove: (element: SugarElement<Element>, clazz: string) => void;
declare const toggle: (element: SugarElement<Element>, clazz: string) => boolean;
declare const toggler: (element: SugarElement<Element>, clazz: string) => Toggler;
declare const has: (element: SugarElement<Node>, clazz: string) => boolean;
export { add, remove, toggle, toggler, has };
//# sourceMappingURL=Class.d.ts.map