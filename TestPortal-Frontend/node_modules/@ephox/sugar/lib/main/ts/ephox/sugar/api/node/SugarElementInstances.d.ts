import { Eq, Pprint, Testable } from '@ephox/dispute';
import { SugarElement } from './SugarElement';
type Eq<A> = Eq.Eq<A>;
type Pprint<A> = Pprint.Pprint<A>;
type Testable<A> = Testable.Testable<A>;
export declare const eqElement: <T extends Node>() => Eq<SugarElement<T>>;
export declare const pprintElement: <T extends Node>() => Pprint<SugarElement<T>>;
export declare const tElement: <T extends Node>() => Testable<SugarElement<T>>;
export {};
//# sourceMappingURL=SugarElementInstances.d.ts.map