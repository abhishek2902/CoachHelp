import { SugarElement } from '../../api/node/SugarElement';
import { SimSelection } from '../../api/selection/SimSelection';
import { Situ } from '../../api/selection/Situ';
declare const beforeSpecial: (element: SugarElement<Node>, offset: number) => Situ;
declare const preprocessRelative: (startSitu: Situ, finishSitu: Situ) => SimSelection;
declare const preprocessExact: (start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number) => SimSelection;
declare const preprocess: (selection: SimSelection) => SimSelection;
export { beforeSpecial, preprocess, preprocessRelative, preprocessExact };
//# sourceMappingURL=Prefilter.d.ts.map