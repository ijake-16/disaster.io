import { KbdKey } from '@solid-primitives/keyboard';
import * as solid_js_store_types_store_d_ts from 'solid-js/store/types/store.d.ts';
import * as solid_js_store from 'solid-js/store';
import { DEV as DEV$1, unwrap } from 'solid-js/store';
import * as solid_js_types_reactive_signal_d_ts from 'solid-js/types/reactive/signal.d.ts';
import * as SolidAPI from 'solid-js';
import { DEV, getOwner, getListener, onCleanup, $PROXY, untrack } from 'solid-js';
import * as WebAPI from 'solid-js/web';

declare enum NodeType {
    Root = "root",
    Component = "component",
    Element = "element",
    Effect = "effect",
    Render = "render",
    Memo = "memo",
    Computation = "computation",
    Refresh = "refresh",
    Context = "context",
    CatchError = "catchError",
    Signal = "signal",
    Store = "store"
}

declare const enum DevEventType {
    RootCreated = "RootCreated"
}
type DevEventDataMap = {
    [DevEventType.RootCreated]: Solid.Owner;
};
type StoredDevEvent = {
    [K in keyof DevEventDataMap]: {
        timestamp: number;
        type: K;
        data: DevEventDataMap[K];
    };
}[keyof DevEventDataMap];
declare global {
    /** Solid DEV APIs exposed to the debugger by the setup script */
    var SolidDevtools$$: {
        readonly Solid: typeof SolidAPI;
        readonly Store: typeof solid_js_store;
        readonly Web: typeof WebAPI;
        readonly DEV: NonNullable<typeof DEV>;
        readonly getOwner: typeof getOwner;
        readonly createRoot: typeof SolidAPI.createRoot;
        readonly getListener: typeof getListener;
        readonly onCleanup: typeof onCleanup;
        readonly $PROXY: typeof $PROXY;
        readonly untrack: typeof untrack;
        readonly STORE_DEV: NonNullable<typeof DEV$1>;
        readonly unwrap: typeof unwrap;
        readonly getDevEvents: () => StoredDevEvent[];
        readonly locatorOptions: LocatorOptions | null;
        readonly versions: {
            readonly client: string | null;
            readonly solid: string | null;
            readonly expectedSolid: string | null;
        };
        readonly getOwnerLocation: (owner: Solid.Owner) => string | null;
    } | undefined;
}
declare namespace Solid {
    type OwnerBase = SolidAPI.Owner;
    type SourceMapValue = solid_js_types_reactive_signal_d_ts.SourceMapValue;
    type Signal = solid_js_types_reactive_signal_d_ts.SignalState<unknown>;
    type Computation = solid_js_types_reactive_signal_d_ts.Computation<unknown>;
    type Memo = solid_js_types_reactive_signal_d_ts.Memo<unknown>;
    type RootFunction<T> = solid_js_types_reactive_signal_d_ts.RootFunction<T>;
    type EffectFunction = solid_js_types_reactive_signal_d_ts.EffectFunction<unknown>;
    type Component = solid_js_types_reactive_signal_d_ts.DevComponent<{
        [key: string]: unknown;
    }>;
    type CatchError = Omit<Computation, 'fn'> & {
        fn: undefined;
    };
    type Root = OwnerBase & {
        attachedTo?: Owner;
        isDisposed?: true;
        isInternal?: true;
        context: null;
        fn?: never;
        state?: never;
        updatedAt?: never;
        sources?: never;
        sourceSlots?: never;
        value?: never;
        pure?: never;
    };
    type Owner = Root | Computation | CatchError;
    type StoreNode = solid_js_store.StoreNode;
    type NotWrappable = solid_js_store.NotWrappable;
    type OnStoreNodeUpdate = solid_js_store_types_store_d_ts.OnStoreNodeUpdate;
    type Store = SourceMapValue & {
        value: StoreNode;
    };
}
declare module 'solid-js/types/reactive/signal.d.ts' {
    interface Owner {
        sdtType?: NodeType;
        sdtSubRoots?: Solid.Owner[] | null;
    }
}

type TargetIDE = 'vscode' | 'webstorm' | 'atom' | 'vscode-insiders';
type SourceLocation = {
    file: string;
    line: number;
    column: number;
};
type SourceCodeData = SourceLocation & {
    projectPath: string;
    element: HTMLElement | string | undefined;
};
type TargetURLFunction = (data: SourceCodeData) => string | void;

type LocatorOptions = {
    /** Choose in which IDE the component source code should be revealed. */
    targetIDE?: false | TargetIDE | TargetURLFunction;
    /**
     * Holding which key should enable the locator overlay?
     * @default 'Alt'
     */
    key?: false | KbdKey;
};

/**
 * Set the location of the owner in source code.
 * Used by the babel plugin.
 */
declare function setOwnerLocation(location: string): void;
declare function getOwnerLocation(owner: Solid.Owner): string | null;
declare function useLocator(options: LocatorOptions): void;
declare function setClientVersion(version: string): void;
declare function setSolidVersion(version: string, expected: string): void;

export { getOwnerLocation, setClientVersion, setOwnerLocation, setSolidVersion, useLocator };
