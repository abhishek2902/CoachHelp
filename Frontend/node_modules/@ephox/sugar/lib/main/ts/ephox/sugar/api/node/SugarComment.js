import { NodeValue } from '../../impl/NodeValue';
import * as SugarNode from './SugarNode';
const api = NodeValue(SugarNode.isComment, 'comment');
const get = (element) => api.get(element);
const getOption = (element) => api.getOption(element);
const set = (element, value) => api.set(element, value);
export { get, getOption, set };
//# sourceMappingURL=SugarComment.js.map