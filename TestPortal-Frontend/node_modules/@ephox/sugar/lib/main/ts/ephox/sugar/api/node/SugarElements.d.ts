import { SugarElement } from './SugarElement';
type ElementTuple<T> = {
    [K in keyof T]: SugarElement<T[K]>;
};
declare const fromHtml: <T extends Node[]>(html: string, scope?: Document | null) => ElementTuple<T>;
declare const fromTags: (tags: string[], scope?: Document | null) => SugarElement<HTMLElement>[];
declare const fromText: (texts: string[], scope?: Document | null) => SugarElement<Text>[];
declare const fromDom: <T extends Node | Window>(nodes: ArrayLike<T>) => SugarElement<T>[];
export { fromHtml, fromTags, fromText, fromDom };
//# sourceMappingURL=SugarElements.d.ts.map