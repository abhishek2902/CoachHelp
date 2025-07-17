import { EventArgs, EventFilter, EventHandler, EventUnbinder } from '../api/events/Types';
import { SugarElement } from '../api/node/SugarElement';
/** Wraps an Event in an EventArgs structure.
 * The returned EventArgs structure has its target set to the "original" target if possible.
 * See SugarShadowDom.getOriginalEventTarget
 */
declare const fromRawEvent: <E extends Event, T extends Node | Window = Node>(rawEvent: E) => EventArgs<E, T>;
declare const bind: <E extends Event, T extends Node | Window>(element: SugarElement<EventTarget>, event: string, filter: EventFilter<E>, handler: EventHandler<E, T>) => EventUnbinder;
declare const capture: <E extends Event, T extends Node | Window>(element: SugarElement<EventTarget>, event: string, filter: EventFilter<E>, handler: EventHandler<E, T>) => EventUnbinder;
export { bind, capture, fromRawEvent };
//# sourceMappingURL=FilteredEvent.d.ts.map