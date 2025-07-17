import { SugarElement } from '../node/SugarElement';
type TogglableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLOptionElement | HTMLButtonElement;
declare const get: (element: SugarElement<TogglableElement>) => string;
declare const set: (element: SugarElement<TogglableElement>, value: string) => void;
export { set, get };
//# sourceMappingURL=Value.d.ts.map