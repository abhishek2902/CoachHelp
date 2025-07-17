import { SugarElement } from '../node/SugarElement';
interface SelectionStart {
    startContainer: () => SugarElement<Node>;
    startOffset: () => number;
}
declare const isLeft: (parent: SugarElement<Node>, selection: SelectionStart) => boolean;
declare const isAtLeftEdge: (parent: SugarElement<Node>, element: SugarElement<Node>, offset: number) => boolean;
declare const isRight: (parent: SugarElement<Node>, selection: SelectionStart) => boolean;
declare const isAtRightEdge: (parent: SugarElement<Node>, element: SugarElement<Node>, offset: number) => boolean;
export { isLeft, isAtLeftEdge, isRight, isAtRightEdge };
//# sourceMappingURL=Edge.d.ts.map