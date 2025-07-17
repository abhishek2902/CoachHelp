import { SugarElement } from '../node/SugarElement';
import { SimRange } from './SimRange';
import { Situ } from './Situ';
export interface SimSelection {
    fold: <U>(domRange: (rng: Range) => U, relative: (startSitu: Situ, finishSitu: Situ) => U, exact: (start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number) => U) => U;
    match: <U>(branches: {
        domRange: (rng: Range) => U;
        relative: (startSitu: Situ, finishSitu: Situ) => U;
        exact: (start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number) => U;
    }) => U;
    log: (label: string) => void;
}
export declare const SimSelection: {
    domRange: (rng: Range) => SimSelection;
    relative: (startSitu: Situ, finishSitu: Situ) => SimSelection;
    exact: (start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number) => SimSelection;
    exactFromRange: (simRange: SimRange) => SimSelection;
    getWin: (selection: SimSelection) => SugarElement<Window>;
    range: (start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number) => SimRange;
};
//# sourceMappingURL=SimSelection.d.ts.map