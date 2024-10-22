import { PrimitiveValue, AnyFunction } from '@solid-primitives/utils';
import { Accessor, MemoOptions, Setter, SignalOptions } from 'solid-js';

type WritableDeep<T> = 0 extends 1 & T ? T : T extends PrimitiveValue ? T : unknown extends T ? T : {
    -readonly [K in keyof T]: WritableDeep<T[K]>;
};
declare const untrackedCallback: <Fn extends AnyFunction>(fn: Fn) => Fn;
declare const useIsTouch: () => () => boolean;
declare const useIsMobile: () => () => boolean;
declare function createHover(handle: (hovering: boolean) => void): {
    onMouseEnter: VoidFunction;
    onMouseLeave: VoidFunction;
};
/**
 * Reactive array reducer — if at least one consumer (boolean signal) is enabled — the returned result will the `true`.
 *
 * For **IOC**
 */
declare function createConsumers(initial?: readonly Accessor<boolean>[]): [needed: Accessor<boolean>, addConsumer: (consumer: Accessor<boolean>) => void];
type DerivedSignal<T> = [
    value: Accessor<T>,
    setSource: (source?: Accessor<T>) => Accessor<T> | undefined
];
/**
 * For **IOC**
 */
declare function createDerivedSignal<T>(): DerivedSignal<T>;
declare function createDerivedSignal<T>(fallback: T, options?: MemoOptions<T>): DerivedSignal<T>;
declare function makeHoverElementListener(onHover: (el: HTMLElement | null) => void): void;
type Atom<T> = Accessor<T> & {
    get value(): T;
    peak(): T;
    set(value: T): T;
    update: Setter<T>;
    trigger(): void;
};
declare function atom<T>(initialValue: T, options?: SignalOptions<T>): Atom<T>;
declare function atom(initialValue?: undefined, options?: SignalOptions<undefined>): Atom<undefined>;
/**
 * Creates a signal that will be activated for a given amount of time on every "ping" — a call to the listener function.
 */
declare function createPingedSignal(timeout?: number): [isUpdated: Accessor<boolean>, ping: VoidFunction];
declare function handleTupleUpdate<T extends readonly [PropertyKey, any], O = {
    readonly [K in T as K[0]]: (value: K[1]) => void;
}>(handlers: O): (update: T) => void;
declare function handleTupleUpdates<T extends readonly [PropertyKey, any], O = {
    readonly [K in T as K[0]]: (value: K[1]) => void;
}>(handlers: O): (updates: T[]) => void;

export { Atom, DerivedSignal, WritableDeep, atom, createConsumers, createDerivedSignal, createHover, createPingedSignal, handleTupleUpdate, handleTupleUpdates, makeHoverElementListener, untrackedCallback, useIsMobile, useIsTouch };
