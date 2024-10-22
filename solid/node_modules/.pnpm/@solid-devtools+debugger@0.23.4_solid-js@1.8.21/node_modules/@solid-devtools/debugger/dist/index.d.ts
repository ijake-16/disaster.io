import { S as Solid, V as ValueUpdateListener, D as DevEventType, L as LocatorOptions, N as NodeType } from './index-9809b963.js';
export { u as useDebugger, a as useLocator } from './index-9809b963.js';
import * as solid_js from 'solid-js';
import * as solid_js_store_types_store from 'solid-js/store/types/store';
import * as solid_js_types_reactive_signal_d_ts from 'solid-js/types/reactive/signal.d.ts';
import * as WebAPI from 'solid-js/web';
import * as solid_js_store from 'solid-js/store';
import '@solid-primitives/event-bus';
import '@solid-devtools/shared/utils';
import '@solid-primitives/keyboard';
import 'solid-js/store/types/store.d.ts';

/**
 * Runs the callback on every Solid Graph Update – whenever computations update because of a signal change.
 * The listener is automatically cleaned-up on root dispose.
 *
 * This will listen to all updates of the reactive graph — including ones outside of the <Debugger> component, and debugger internal computations.
 */
declare function addSolidUpdateListener(onUpdate: VoidFunction): VoidFunction;
/**
 * Patches the "fn" prop of SolidComputation. Will execute the {@link onRun} callback whenever the computation is executed.
 * @param owner computation to patch
 * @param onRun execution handler
 *
 * {@link onRun} is provided with `execute()` function, and a `prev` value. `execute` is the computation handler function, it needs to be called inside {@link onRun} to calculate the next value or run side-effects.
 *
 * @example
 * ```ts
 * interceptComputationRerun(owner, (fn, prev) => {
 * 	// do something before execution
 * 	fn()
 * 	// do something after execution
 * })
 * ```
 */
declare function interceptComputationRerun(owner: Solid.Computation, onRun: <T>(execute: () => T, prev: T) => void): void;
/**
 * Patches the owner/signal value, firing the callback on each update immediately as it happened.
 */
declare function observeValueUpdate(node: Solid.SourceMapValue | Solid.Computation, onUpdate: ValueUpdateListener, symbol: symbol): void;
declare function removeValueUpdateObserver(node: Solid.SourceMapValue | Solid.Computation, symbol: symbol): void;
declare function makeValueUpdateListener(node: Solid.SourceMapValue | Solid.Computation, onUpdate: ValueUpdateListener, symbol: symbol): void;

declare const SolidApi: {
    readonly Solid: typeof solid_js;
    readonly Store: typeof solid_js_store;
    readonly Web: typeof WebAPI;
    readonly DEV: {
        readonly hooks: {
            afterUpdate: (() => void) | null;
            afterCreateOwner: ((owner: solid_js.Owner) => void) | null;
        };
        readonly writeSignal: typeof solid_js_types_reactive_signal_d_ts.writeSignal;
        readonly registerGraph: typeof solid_js_types_reactive_signal_d_ts.registerGraph;
    };
    readonly getOwner: typeof solid_js.getOwner;
    readonly createRoot: typeof solid_js.createRoot;
    readonly getListener: typeof solid_js.getListener;
    readonly onCleanup: typeof solid_js.onCleanup;
    readonly $PROXY: typeof solid_js.$PROXY;
    readonly untrack: typeof solid_js.untrack;
    readonly STORE_DEV: {
        readonly $NODE: typeof solid_js_store_types_store.$NODE;
        readonly isWrappable: typeof solid_js_store_types_store.isWrappable;
        readonly hooks: {
            onStoreNodeUpdate: solid_js_store_types_store.OnStoreNodeUpdate | null;
        };
    };
    readonly unwrap: typeof solid_js_store.unwrap;
    readonly getDevEvents: () => {
        timestamp: number;
        type: DevEventType.RootCreated;
        data: Solid.Owner;
    }[];
    readonly locatorOptions: LocatorOptions | null;
    readonly versions: {
        readonly client: string | null;
        readonly solid: string | null;
        readonly expectedSolid: string | null;
    };
    readonly getOwnerLocation: (owner: Solid.Owner) => string | null;
};

/**
 * Helps the debugger find and reattach an reactive owner created by `createRoot` to it's detached parent.
 *
 * Call this synchronously inside `createRoot` callback body, whenever you are using `createRoot` yourself to dispose of computations early, or inside `<For>`/`<Index>` components to reattach their children to reactive graph visible by the devtools debugger.
 * @example
 * createRoot(dispose => {
 * 	// This reactive Owner disapears form the owner tree
 *
 * 	// Reattach the Owner to the tree:
 * 	attachDebugger();
 * });
 */
declare function attachDebugger(owner?: solid_js.Owner | null): void;
/**
 * Unobserves currently observed root owners.
 * This is not reversable, and should be used only when you are sure that they won't be used anymore.
 */
declare function unobserveAllRoots(): void;
/**
 * Sold's `createRoot` primitive that won't be tracked by the debugger.
 */
declare const createInternalRoot: typeof SolidApi.createRoot;

declare const isSolidOwner: (o: Readonly<Solid.Owner | Solid.Store | Solid.Signal>) => o is Solid.Owner;
declare const isSolidComputation: (o: Readonly<Solid.Owner>) => o is solid_js_types_reactive_signal_d_ts.Computation<unknown, unknown>;
declare const isSolidRoot: (o: Readonly<Solid.Owner>) => o is Solid.Root;
declare const isSolidMemo: (o: Readonly<Solid.Owner>) => o is solid_js_types_reactive_signal_d_ts.Memo<unknown, unknown>;
declare const isSolidStore: (o: Solid.Owner | Solid.SourceMapValue | Solid.Store) => o is Solid.Store;
declare const isSolidSignal: (o: Solid.SourceMapValue) => o is solid_js_types_reactive_signal_d_ts.SignalState<unknown>;
declare function getNodeType(o: Readonly<Solid.Signal | Solid.Owner | Solid.Store>): NodeType;
declare const getOwnerType: (o: Readonly<Solid.Owner>) => NodeType;
declare const getNodeName: (o: {
    name?: string;
}) => string | undefined;
declare function lookupOwner(owner: Solid.Owner, predicate: (owner: Solid.Owner) => boolean): Solid.Owner | null;
/**
 * Attach onCleanup callback to a reactive owner
 * @param prepend add the callback to the front of the stack, instead of pushing, fot it to be called before other cleanup callbacks.
 * @returns a function to remove the cleanup callback
 */
declare function onOwnerCleanup(owner: Solid.Owner, fn: VoidFunction, prepend?: boolean, symbol?: symbol): VoidFunction;
/**
 * Attach onCleanup callback to the parent of a reactive owner if it has one.
 * @param prepend add the callback to the front of the stack, instead of pushing, fot it to be called before other cleanup callbacks.
 * @returns a function to remove the cleanup callback
 */
declare function onParentCleanup(owner: Solid.Owner, fn: VoidFunction, prepend?: boolean, symbol?: symbol): VoidFunction;

export { addSolidUpdateListener, attachDebugger, createInternalRoot, getNodeName, getNodeType, getOwnerType, interceptComputationRerun, isSolidComputation, isSolidMemo, isSolidOwner, isSolidRoot, isSolidSignal, isSolidStore, lookupOwner, makeValueUpdateListener, observeValueUpdate, onOwnerCleanup, onParentCleanup, removeValueUpdateObserver, unobserveAllRoots };
