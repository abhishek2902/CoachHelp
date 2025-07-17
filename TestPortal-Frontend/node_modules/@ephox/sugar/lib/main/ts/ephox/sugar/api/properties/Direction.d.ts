import { SugarElement } from '../node/SugarElement';
declare const onDirection: <T = any>(isLtr: T, isRtl: T) => (element: SugarElement<Element>) => T;
declare const getDirection: (element: SugarElement<Element>) => 'rtl' | 'ltr';
export { onDirection, getDirection };
//# sourceMappingURL=Direction.d.ts.map