import { SugarElement } from '../node/SugarElement';
export interface SimRange {
    readonly start: SugarElement<Node>;
    readonly soffset: number;
    readonly finish: SugarElement<Node>;
    readonly foffset: number;
}
export declare const SimRange: {
    create: (start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number) => SimRange;
};
//# sourceMappingURL=SimRange.d.ts.map