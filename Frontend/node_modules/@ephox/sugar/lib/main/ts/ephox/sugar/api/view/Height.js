import { Dimension } from '../../impl/Dimension';
import * as RuntimeSize from '../../impl/RuntimeSize';
import * as SugarBody from '../node/SugarBody';
import * as Css from '../properties/Css';
const api = Dimension('height', (element) => {
    // getBoundingClientRect gives better results than offsetHeight for tables with captions on Firefox
    const dom = element.dom;
    return SugarBody.inBody(element) ? dom.getBoundingClientRect().height : dom.offsetHeight;
});
const set = (element, h) => api.set(element, h);
const get = (element) => api.get(element);
const getOuter = (element) => api.getOuter(element);
const getInner = RuntimeSize.getInnerHeight;
const getRuntime = RuntimeSize.getHeight;
const setMax = (element, value) => {
    // These properties affect the absolute max-height, they are not counted natively, we want to include these properties.
    const inclusions = ['margin-top', 'border-top-width', 'padding-top', 'padding-bottom', 'border-bottom-width', 'margin-bottom'];
    const absMax = api.max(element, value, inclusions);
    Css.set(element, 'max-height', absMax + 'px');
};
export { set, get, getInner, getOuter, getRuntime, setMax };
//# sourceMappingURL=Height.js.map