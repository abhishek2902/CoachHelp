import { SugarElement } from '../node/SugarElement';
import { EventHandler, EventUnbinder } from './Types';
declare const bind: {
    <K extends keyof HTMLElementEventMap, T extends Node | Window = Node>(element: SugarElement<EventTarget>, event: K, handler: EventHandler<HTMLElementEventMap[K], T>): EventUnbinder;
    <E extends Event, T extends Node | Window = Node>(element: SugarElement<EventTarget>, event: string, handler: EventHandler<E, T>): EventUnbinder;
};
declare const capture: {
    <K extends keyof HTMLElementEventMap, T extends Node | Window = Node>(element: SugarElement<EventTarget>, event: K, handler: EventHandler<HTMLElementEventMap[K], T>): EventUnbinder;
    <E extends Event, T extends Node | Window = Node>(element: SugarElement<EventTarget>, event: string, handler: EventHandler<E, T>): EventUnbinder;
};
declare const fromRawEvent: <E extends Event, T extends Node | Window = Node>(rawEvent: E) => import("./Types").EventArgs<E, T>;
export { bind, capture, fromRawEvent };
//# sourceMappingURL=DomEvent.d.ts.map