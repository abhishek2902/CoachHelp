import { Eq, Pnode, Pprint, Testable } from '@ephox/dispute';
import * as Html from '../properties/Html';
export const eqElement = () => Eq.contramap(Eq.tripleEq, (e) => e.dom);
export const pprintElement = () => Pprint.pprint((e) => Pnode.single(Html.getOuter(e)));
export const tElement = () => Testable.testable(eqElement(), pprintElement());
//# sourceMappingURL=SugarElementInstances.js.map