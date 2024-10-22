import { Accessor, Setter } from 'solid-js';
import { AnyFunction } from '@solid-primitives/utils';

type Listener<T = void> = (payload: T) => void;
type Listen<T = void> = (listener: Listener<T>) => VoidFunction;
type Emit<T = void> = (..._: void extends T ? [payload?: T] : [payload: T]) => void;
declare class EventBusCore<T> extends Set<Listener<T>> {
    emit(..._: void extends T ? [payload?: T] : [payload: T]): void;
}
interface EventBus<T> {
    readonly listen: Listen<T>;
    readonly emit: Emit<T>;
    readonly clear: VoidFunction;
}
/**
 * Provides a simple way to listen to and emit events. All listeners are automatically unsubscribed on cleanup.
 *
 * @returns the emitter: `{listen, emit, clear}`
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-bus#createEventBus
 *
 * @example
const bus = createEventBus<string>();
// bus can be destructured:
const { listen, emit, clear } = bus;

const unsub = bus.listen((a) => console.log(a));

bus.emit("foo");

// unsub gets called automatically on cleanup
unsub();
 */
declare function createEventBus<T>(): EventBus<T>;

declare class EmitterCore<M extends Record<PropertyKey, any>> extends Map<keyof M, EventBusCore<M[any]>> {
    on<K extends keyof M>(event: K, listener: Listener<M[K]>): void;
    off<K extends keyof M>(event: K, listener: Listener<M[K]>): void;
    emit<K extends keyof M>(event: K, ..._: void extends M[K] ? [payload?: M[K]] : [payload: M[K]]): void;
}
type EmitterOn<M extends Record<PropertyKey, any>> = <K extends keyof M>(event: K, listener: Listener<M[K]>) => VoidFunction;
type EmitterEmit<M extends Record<PropertyKey, any>> = EmitterCore<M>["emit"];
type Emitter<M extends Record<PropertyKey, any>> = {
    readonly on: EmitterOn<M>;
    readonly emit: EmitterEmit<M>;
    readonly clear: VoidFunction;
};
/**
 * Creates an emitter with which you can listen to and emit various events.
 *
 * @returns emitter mathods: `{on, emit, clear}`
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-bus#createEmitter
 *
 * @example
 * const emitter = createEmitter<{
 *   foo: number;
 *   bar: string;
 * }>();
 * // can be destructured
 * const { on, emit, clear } = emitter;
 *
 * emitter.on("foo", e => {});
 * emitter.on("bar", e => {});
 *
 * emitter.emit("foo", 0);
 * emitter.emit("bar", "hello");
 */
declare function createEmitter<M extends Record<PropertyKey, any>>(): Emitter<M>;
type EmitterPayload<M extends Record<PropertyKey, any>> = {
    [K in keyof M]: {
        readonly name: K;
        readonly details: M[K];
    };
}[keyof M];
type EmitterListener<M extends Record<PropertyKey, any>> = (payload: EmitterPayload<M>) => void;
type EmitterListen<M extends Record<PropertyKey, any>> = (listener: EmitterListener<M>) => VoidFunction;
type GlobalEmitter<M extends Record<PropertyKey, any>> = {
    readonly on: EmitterOn<M>;
    readonly listen: EmitterListen<M>;
    readonly emit: EmitterEmit<M>;
    readonly clear: VoidFunction;
};
/**
 * Creates an emitter with which you can listen to and emit various events. With this emitter you can also listen to all events.
 *
 * @returns emitter mathods: `{on, listen, emit, clear}`
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-bus#createGlobalEmitter
 *
 * @example
 * const emitter = createGlobalEmitter<{
 *   foo: number;
 *   bar: string;
 * }>();
 * // can be destructured
 * const { on, emit, clear, listen } = emitter;
 *
 * emitter.on("foo", e => {});
 * emitter.on("bar", e => {});
 *
 * emitter.emit("foo", 0);
 * emitter.emit("bar", "hello");
 *
 * emitter.listen(e => {
 *   switch (e.name) {
 *     case "foo": {
 *       e.details;
 *       break;
 *     }
 *     case "bar": {
 *       e.details;
 *       break;
 *     }
 *   }
 * })
 */
declare function createGlobalEmitter<M extends Record<PropertyKey, any>>(): GlobalEmitter<M>;

type EventHubPayloadMap<M> = {
    [K in keyof M]: M[K] extends {
        emit: Emit<infer T>;
    } ? T : never;
};
type EventHubValue<M> = {
    [K in keyof M]: M[K] extends {
        value: Accessor<infer T>;
    } ? T : never;
};
/**
 * Required interface of a EventBus, to be able to be used as a channel in the EventHub
 */
interface EventHubChannel<T, V = T> {
    readonly listen: Listen<T>;
    readonly emit: Emit<T>;
    readonly value?: Accessor<V>;
}
type EventHub<M extends {
    readonly [key: string | number]: EventHubChannel<any>;
}> = Readonly<M> & {
    readonly on: EmitterOn<EventHubPayloadMap<M>>;
    readonly emit: EmitterEmit<EventHubPayloadMap<M>>;
    readonly listen: EmitterListen<EventHubPayloadMap<M>>;
    readonly value: EventHubValue<M>;
};
/**
 * Provides helpers for using a group of event buses.
 *
 * Can be used with `createEventBus`, `createEventStack` or any emitter that has the same api.
 *
 * @param defineChannels object with defined channels or a defineChannels function returning channels.
 *
 * @returns hub functions: `{on, emit, listen, value}` + channels available by their key
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-bus#createEventHub
 *
 * @example
 * const hub = createEventHub({
 *    busA: createEventBus<void>(),
 *    busB: createEventBus<string>(),
 *    busC: createEventStack<{ text: string }>()
 * });
 * // can be destructured
 * const { busA, busB, on, listen, emit } = hub;
 *
 * hub.on("busA", e => {});
 * hub.on("busB", e => {});
 *
 * hub.emit("busA", 0);
 * hub.emit("busB", "foo");
 */
declare function createEventHub<M extends {
    readonly [key: string | number]: EventHubChannel<any>;
}>(defineChannels: ((bus: typeof createEventBus) => M) | M): EventHub<M>;

type EventStackPayload<E, V = E> = {
    readonly event: V;
    readonly stack: V[];
    readonly remove: VoidFunction;
};
type EventStack<E, V = E> = {
    readonly listen: Listen<EventStackPayload<V>>;
    readonly clear: VoidFunction;
    readonly value: Accessor<V[]>;
    readonly setValue: Setter<V[]>;
    readonly remove: (value: V) => boolean;
    readonly emit: Emit<E>;
};
type EventStackConfig<E, V = E> = {
    readonly length?: number;
    readonly toValue?: (event: E, stack: V[]) => V;
};
/**
 * Provides all the base functions of an event-emitter, functions for managing listeners, it's behavior could be customized with an config object.
 * Additionally it provides the emitted events in a list/history form, with tools to manage it.
 *
 * @returns event stack: `{listen, emit, remove, clear, value, setValue}`
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-bus#createEventStack
 *
 * @example
const bus = createEventStack<{ message: string }>();
// can be destructured:
const { listen, emit, clear, value } = bus;

const listener: EventStackListener<{ text: string }> = ({ event, stack, remove }) => {
  console.log(event, stack);
  // you can remove the value from stack
  remove();
};
bus.listen(listener);

bus.emit({ text: "foo" });

// a signal accessor:
bus.value() // => { text: string }[]

bus.setValue(stack => stack.filter(item => {...}))
 */
declare function createEventStack<E extends object>(config?: EventStackConfig<E>): EventStack<E, E>;
declare function createEventStack<E, V extends object>(config: EventStackConfig<E, V> & {
    toValue: (event: E, stack: V[]) => V;
}): EventStack<E, V>;

/**
 * Turns a stream-like listen function, into a promise resolving when the first event is captured.
 * @param subscribe listen function from any EventBus/Emitter
 * @returns a promise resulting in the captured event value
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-bus#toPromise
 *
 * @example
 * const emitter = createEventBus<string>();
 * const event = await toPromise(emitter.listen);
 */
declare function toPromise<T>(subscribe: Listen<T>): Promise<T>;
/**
 * Listen to any EventBus/Emitter, but the listener will automatically unsubscribe on the first captured event. So the callback will run only **once**.
 *
 * @param subscribe Emitter's `listen` function
 * @param listener callback called when an event is emitted
 *
 * @returns unsubscribe function
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-bus#once
 *
 * @example
 * const { listen, emit } = createEventBus<string>();
 * const unsub = once(listen, event => console.log(event));
 *
 * emit("foo") // will log "foo" and unsub
 *
 * emit("bar") // won't log
 */
declare function once<T>(subscribe: Listen<T>, listener: Listener<T>): VoidFunction;
/**
 * Wraps `emit` calls inside a `createEffect`. It causes that listeners execute having an reactive owner available. It allows for usage of effects, memos and other primitives inside listeners, without having to create a synthetic root.
 *
 * @param emit the emit function of any emitter/event-bus
 * @returns modified emit function
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-bus#toEffect
 *
 * @example
 * const { listen, emit } = createEventBus();
 * const emitInEffect = toEffect(emit);
 * listen(() => console.log(getOwner()))
 *
 * // ...sometime later (after root initiation):
 * emit() // listener will log `null`
 * emitInEffect() // listener will log an owner object
 */
declare function toEffect<T>(emit: Emit<T>): Emit<T>;
/**
 * Wraps `emit` calls inside a `batch` call. It causes that listeners execute in a single batch, so they are not executed in sepatate queue ticks.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-bus#batchEmits
 */
declare function batchEmits<T extends {
    emit: AnyFunction;
}>(bus: T): T;

export { Emit, Emitter, EmitterCore, EmitterEmit, EmitterListen, EmitterListener, EmitterOn, EmitterPayload, EventBus, EventBusCore, EventHub, EventHubChannel, EventHubPayloadMap, EventHubValue, EventStack, EventStackConfig, EventStackPayload, GlobalEmitter, Listen, Listener, batchEmits, createEmitter, createEventBus, createEventHub, createEventStack, createGlobalEmitter, once, toEffect, toPromise };
