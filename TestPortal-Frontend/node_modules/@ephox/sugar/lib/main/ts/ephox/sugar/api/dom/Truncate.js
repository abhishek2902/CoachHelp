import * as SugarShadowDom from '../node/SugarShadowDom';
import * as Html from '../properties/Html';
import * as Replication from './Replication';
const getHtml = (element) => {
    if (SugarShadowDom.isShadowRoot(element)) {
        return '#shadow-root';
    }
    else {
        const clone = Replication.shallow(element);
        return Html.getOuter(clone);
    }
};
export { getHtml };
//# sourceMappingURL=Truncate.js.map