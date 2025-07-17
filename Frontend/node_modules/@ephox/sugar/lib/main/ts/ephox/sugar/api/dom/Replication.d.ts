import { HTMLElementFullTagNameMap } from '../../alien/DomTypes';
import { SugarElement } from '../node/SugarElement';
/** Shallow clone - just the tag, no children */
declare const shallow: <E extends Node>(original: SugarElement<E>) => SugarElement<E>;
/** Deep clone - everything copied including children */
declare const deep: <E extends Node>(original: SugarElement<E>) => SugarElement<E>;
/** Shallow clone, with a new tag */
declare const shallowAs: <K extends keyof HTMLElementTagNameMap | keyof HTMLElementDeprecatedTagNameMap>(original: SugarElement<Element>, tag: K) => SugarElement<HTMLElementFullTagNameMap[K]>;
/** Deep clone, with a new tag */
declare const copy: <K extends keyof HTMLElementTagNameMap | keyof HTMLElementDeprecatedTagNameMap>(original: SugarElement<Element>, tag: K) => SugarElement<HTMLElementFullTagNameMap[K]>;
/** Change the tag name, but keep all children */
declare const mutate: <K extends keyof HTMLElementTagNameMap | keyof HTMLElementDeprecatedTagNameMap>(original: SugarElement<Element>, tag: K) => SugarElement<HTMLElementFullTagNameMap[K]>;
export { shallow, shallowAs, deep, copy, mutate };
//# sourceMappingURL=Replication.d.ts.map