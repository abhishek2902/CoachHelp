import { SugarElement } from '../node/SugarElement';
export interface Situ {
    fold: <U>(before: (element: SugarElement<Node>) => U, on: (element: SugarElement<Node>, offset: number) => U, after: (element: SugarElement<Node>) => U) => U;
    match: <U>(branches: {
        before: (element: SugarElement<Node>) => U;
        on: (element: SugarElement<Node>, offset: number) => U;
        after: (element: SugarElement<Node>) => U;
    }) => U;
    log: (label: string) => void;
}
export declare const Situ: {
    before: (element: SugarElement<Node>) => Situ;
    on: (element: SugarElement<Node>, offset: number) => Situ;
    after: (element: SugarElement<Node>) => Situ;
    cata: <U>(subject: Situ, onBefore: (element: SugarElement<Node>) => U, onOn: (element: SugarElement<Node>, offset: number) => U, onAfter: (element: SugarElement<Node>) => U) => U;
    getStart: (situ: Situ) => SugarElement<Node>;
};
//# sourceMappingURL=Situ.d.ts.map