import { NodeValue } from '../../impl/NodeValue';
import * as SugarNode from './SugarNode';
const api = NodeValue(SugarNode.isText, 'text');
const get = (element) => api.get(element);
const getOption = (element) => api.getOption(element);
const set = (element, value) => api.set(element, value);
export { get, getOption, set };
//# sourceMappingURL=SugarText.js.map