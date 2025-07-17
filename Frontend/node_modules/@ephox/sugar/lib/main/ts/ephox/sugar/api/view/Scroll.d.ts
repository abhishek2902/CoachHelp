import { SugarElement } from '../node/SugarElement';
import { SugarPosition } from './SugarPosition';
interface ScrollCapture {
    readonly save: () => void;
    readonly restore: () => void;
}
declare const get: (_DOC?: SugarElement<Document>) => SugarPosition;
declare const to: (x: number, y: number, _DOC?: SugarElement<Document>) => void;
declare const by: (x: number, y: number, _DOC?: SugarElement<Document>) => void;
declare const setToElement: (win: Window, element: SugarElement<Element>) => void;
declare const preserve: (doc: SugarElement<Document>, f: () => void) => void;
declare const capture: (doc: SugarElement<Document>) => ScrollCapture;
declare const intoView: (element: SugarElement<Element>, alignToTop: boolean) => void;
declare const intoViewIfNeeded: (element: SugarElement<Element>, container: SugarElement<Element>) => void;
declare const scrollBarWidth: () => number;
export { get, to, by, preserve, capture, intoView, intoViewIfNeeded, setToElement, scrollBarWidth };
//# sourceMappingURL=Scroll.d.ts.map