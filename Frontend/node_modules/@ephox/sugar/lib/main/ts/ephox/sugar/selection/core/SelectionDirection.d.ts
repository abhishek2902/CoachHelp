import { SugarElement } from '../../api/node/SugarElement';
import { SimSelection } from '../../api/selection/SimSelection';
type SelectionDirectionHandler<U> = (start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number) => U;
export interface SelectionDirection {
    readonly fold: <U>(ltr: SelectionDirectionHandler<U>, rtl: SelectionDirectionHandler<U>) => U;
    readonly match: <U>(branches: {
        ltr: SelectionDirectionHandler<U>;
        rtl: SelectionDirectionHandler<U>;
    }) => U;
    readonly log: (label: string) => void;
}
type SelectionDirectionConstructor = (start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number) => SelectionDirection;
declare const diagnose: (win: Window, selection: SimSelection) => SelectionDirection;
declare const asLtrRange: (win: Window, selection: SimSelection) => Range;
declare const ltr: SelectionDirectionConstructor;
declare const rtl: SelectionDirectionConstructor;
export { ltr, rtl, diagnose, asLtrRange };
//# sourceMappingURL=SelectionDirection.d.ts.map