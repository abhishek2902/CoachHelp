import { SugarElement } from '../node/SugarElement';
export interface AttributeProperty {
    readonly is: (element: SugarElement<Element>) => boolean;
    readonly remove: (element: SugarElement<Element>) => void;
    readonly set: (element: SugarElement<Element>) => void;
}
export declare const AttributeProperty: (attribute: string, value: string) => AttributeProperty;
//# sourceMappingURL=AttributeProperty.d.ts.map