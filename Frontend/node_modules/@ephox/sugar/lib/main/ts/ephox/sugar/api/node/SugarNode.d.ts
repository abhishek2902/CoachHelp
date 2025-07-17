import { HTMLElementFullTagNameMap } from '../../alien/DomTypes';
import { SugarElement } from './SugarElement';
declare const name: (element: SugarElement<Node>) => string;
declare const type: (element: SugarElement<Node>) => number;
declare const value: (element: SugarElement<Node>) => string | null;
declare const isComment: (element: SugarElement<Node>) => element is SugarElement<Comment>;
declare const isHTMLElement: (element: SugarElement<Node>) => element is SugarElement<HTMLElement>;
declare const isElement: (element: SugarElement<Node>) => element is SugarElement<Element>;
declare const isText: (element: SugarElement<Node>) => element is SugarElement<Text>;
declare const isDocument: (element: SugarElement<Node>) => element is SugarElement<Document>;
declare const isDocumentFragment: (element: SugarElement<Node>) => element is SugarElement<DocumentFragment>;
declare const isTag: <K extends keyof HTMLElementTagNameMap | keyof HTMLElementDeprecatedTagNameMap>(tag: K) => (e: SugarElement<Node>) => e is SugarElement<HTMLElementFullTagNameMap[K]>;
export { name, type, value, isElement, isHTMLElement, isText, isDocument, isDocumentFragment, isComment, isTag };
//# sourceMappingURL=SugarNode.d.ts.map