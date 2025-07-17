import { SugarElement } from '../node/SugarElement';
export interface CssProperty {
    readonly is: (element: SugarElement<Element>) => boolean;
    readonly remove: (element: SugarElement<Element>) => void;
    readonly set: (element: SugarElement<Element>) => void;
}
export declare const CssProperty: (property: string, value: string) => CssProperty;
//# sourceMappingURL=CssProperty.d.ts.map