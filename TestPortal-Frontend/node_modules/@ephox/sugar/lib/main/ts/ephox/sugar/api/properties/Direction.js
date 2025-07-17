import * as Css from './Css';
const onDirection = (isLtr, isRtl) => (element) => getDirection(element) === 'rtl' ? isRtl : isLtr;
const getDirection = (element) => Css.get(element, 'direction') === 'rtl' ? 'rtl' : 'ltr';
export { onDirection, getDirection };
//# sourceMappingURL=Direction.js.map