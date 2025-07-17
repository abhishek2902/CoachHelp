import { SugarElement } from '../api/node/SugarElement';
export interface Dimension {
    readonly get: (element: SugarElement<HTMLElement>) => number;
    readonly set: (element: SugarElement<Node>, value: number | string) => void;
    readonly getOuter: (element: SugarElement<HTMLElement>) => number;
    readonly aggregate: (element: SugarElement<Element>, properties: string[]) => number;
    readonly max: (element: SugarElement<Element>, value: number, properties: string[]) => number;
}
export declare const Dimension: (name: string, getOffset: (e: SugarElement<HTMLElement>) => number) => Dimension;
//# sourceMappingURL=Dimension.d.ts.map