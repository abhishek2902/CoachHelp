import { SugarElement } from '../node/SugarElement';
import { EventHandler } from './Types';
declare const realClick: {
    bind: (element: SugarElement<EventTarget>, f: EventHandler<MouseEvent>) => import("./Types").EventUnbinder;
};
declare const leftDown: {
    bind: (element: SugarElement<EventTarget>, f: EventHandler<MouseEvent>) => import("./Types").EventUnbinder;
};
declare const leftPressedOver: {
    bind: (element: SugarElement<EventTarget>, f: EventHandler<MouseEvent>) => import("./Types").EventUnbinder;
};
declare const leftUp: {
    bind: (element: SugarElement<EventTarget>, f: EventHandler<MouseEvent>) => import("./Types").EventUnbinder;
};
export { realClick, leftDown, leftPressedOver, leftUp };
//# sourceMappingURL=MouseEvents.d.ts.map