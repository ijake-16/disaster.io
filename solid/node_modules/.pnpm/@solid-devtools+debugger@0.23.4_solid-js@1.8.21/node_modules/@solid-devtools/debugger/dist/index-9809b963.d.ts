import * as _solid_primitives_event_bus from '@solid-primitives/event-bus';
import * as solid_js from 'solid-js';
import { DEV, getOwner, getListener, onCleanup, $PROXY, untrack } from 'solid-js';
import { ToDyscriminatedUnion } from '@solid-devtools/shared/utils';
import { KbdKey } from '@solid-primitives/keyboard';
import * as solid_js_store_types_store_d_ts from 'solid-js/store/types/store.d.ts';
import * as solid_js_store from 'solid-js/store';
import { DEV as DEV$1, unwrap } from 'solid-js/store';
import * as solid_js_types_reactive_signal_d_ts from 'solid-js/types/reactive/signal.d.ts';
import * as WebAPI from 'solid-js/web';

/**
 * Main modules and views of the devtools. Used for "routing".
 */
declare enum DevtoolsMainView {
    Structure = "structure"
}
declare const DEFAULT_MAIN_VIEW = DevtoolsMainView.Structure;
declare enum DebuggerModule {
    Locator = "locator",
    Structure = "structure",
    Dgraph = "dgraph"
}
declare enum TreeWalkerMode {
    Owners = "owners",
    Components = "components",
    DOM = "dom"
}
declare const DEFAULT_WALKER_MODE = TreeWalkerMode.Components;
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
declare const NODE_TYPE_NAMES: Readonly<Record<NodeType, string>>;
declare enum ValueItemType {
    Signal = "signal",
    Prop = "prop",
    Value = "value"
}
declare const UNKNOWN = "unknown";

declare namespace SerializedDGraph {
    type Node = {
        name: string;
        depth: number;
        type: Exclude<NodeType, NodeType.Root | NodeType.Component>;
        sources: readonly NodeID[] | undefined;
        observers: readonly NodeID[] | undefined;
        graph: NodeID | undefined;
    };
    type Graph = Record<NodeID, Node>;
}

type DGraphUpdate = SerializedDGraph.Graph | null;

type StructureUpdates = {
    /** Partial means that the updates are based on the previous structure state */
    partial: boolean;
    /** Removed roots */
    removed: NodeID[];
    /** Record: `rootId` -- Record of updated nodes by `nodeId` */
    updated: Partial<Record<NodeID, Partial<Record<NodeID, Mapped.Owner>>>>;
};

type StoreNodeProperty = `${NodeID}:${string}`;

type ToggleInspectedValueData = {
    id: ValueItemID;
    selected: boolean;
};

declare const INFINITY = "Infinity";
declare const NEGATIVE_INFINITY = "NegativeInfinity";
declare const NAN = "NaN";
declare const UNDEFINED = "undefined";
declare enum ValueType {
    Number = "number",
    Boolean = "boolean",
    String = "string",
    Null = "null",
    Symbol = "symbol",
    Array = "array",
    Object = "object",
    Function = "function",
    Getter = "getter",
    Element = "element",
    Instance = "instance",
    Store = "store",
    Unknown = "unknown"
}
type EncodedValueDataMap = {
    [ValueType.Null]: null | typeof UNDEFINED;
    [ValueType.Array]: number | number[];
    [ValueType.Object]: number | {
        [key: string]: number;
    };
    [ValueType.Number]: number | typeof INFINITY | typeof NEGATIVE_INFINITY | typeof NAN;
    [ValueType.Boolean]: boolean;
    [ValueType.String]: string;
    [ValueType.Symbol]: string;
    [ValueType.Function]: string;
    [ValueType.Getter]: string;
    [ValueType.Element]: `${NodeID}:${string}`;
    [ValueType.Instance]: string;
    [ValueType.Store]: `${NodeID}:${number}`;
    [ValueType.Unknown]: never;
};
type EncodedValueMap = {
    [T in ValueType]: [type: T, data: EncodedValueDataMap[T]];
};
type EncodedValue<T extends ValueType = ValueType> = EncodedValueMap[T];
declare enum PropGetterState {
    /** getter is being observed, so it's value is up-to-date */
    Live = "live",
    /** getter is not observed, so it's value may be outdated */
    Stale = "stale"
}
type InspectorUpdateMap = {
    /** the value of a valueItem was updated */
    value: [id: ValueItemID, value: EncodedValue[]];
    /** a valueItem was expanded or collapsed, sends it's appropriable value */
    inspectToggle: [id: ValueItemID, value: EncodedValue[]];
    /** update to a store-node */
    store: [store: StoreNodeProperty, value: EncodedValue[] | null | number];
    /** List of new keys — all of the values are getters, so they won't change */
    propKeys: {
        added: string[];
        removed: string[];
    };
    /** state of getter props (STALE | LIVE) */
    propState: {
        [key in string]: PropGetterState;
    };
};
type InspectorUpdate = {
    [T in keyof InspectorUpdateMap]: [type: T, data: InspectorUpdateMap[T]];
}[keyof InspectorUpdateMap];

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
        readonly Solid: typeof solid_js;
        readonly Store: typeof solid_js_store;
        readonly Web: typeof WebAPI;
        readonly DEV: NonNullable<typeof DEV>;
        readonly getOwner: typeof getOwner;
        readonly createRoot: typeof solid_js.createRoot;
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
type NodeID = `#${string}`;
type ValueItemID = `${ValueItemType.Signal}:${NodeID}` | `${ValueItemType.Prop}:${string}` | ValueItemType.Value;
declare const getValueItemId: <T extends ValueItemType>(type: T, id: T extends ValueItemType.Value ? undefined : string) => ValueItemID;
type ValueUpdateListener = (newValue: unknown, oldValue: unknown) => void;
declare namespace Solid {
    type OwnerBase = solid_js.Owner;
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
type OnStoreNodeUpdate = Solid.OnStoreNodeUpdate & {
    storePath: readonly (string | number)[];
    storeSymbol: symbol;
};
declare namespace Mapped {
    interface Owner {
        id: NodeID;
        type: Exclude<NodeType, NodeType.Refresh | NodeType.Signal | NodeType.Store>;
        children: Owner[];
        name?: string;
        hmr?: true;
        frozen?: true;
    }
    interface Signal {
        type: NodeType.Signal | NodeType.Memo | NodeType.Store;
        name?: string;
        id: NodeID;
        value: EncodedValue[];
    }
    type Props = {
        proxy: boolean;
        record: {
            [key: string]: {
                getter: false | PropGetterState;
                value: EncodedValue[] | null;
            };
        };
    };
    interface OwnerDetails {
        id: NodeID;
        name?: string;
        type: NodeType;
        props?: Props;
        signals: Signal[];
        /** for computations */
        value?: EncodedValue[];
        location?: SourceLocation;
    }
}

type LocationAttr = `${string}:${number}:${number}`;
type LocatorComponent = {
    id: NodeID;
    name: string | undefined;
    element: HTMLElement;
    location?: LocationAttr | undefined;
};
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
type HighlightElementPayload = ToDyscriminatedUnion<{
    node: {
        id: NodeID;
    };
    element: {
        id: NodeID;
    };
}> | null;
declare const WINDOW_PROJECTPATH_PROPERTY = "$sdt_projectPath";
declare const LOCATION_ATTRIBUTE_NAME = "data-source-loc";

declare namespace Debugger {
    type InspectedState = {
        readonly ownerId: NodeID | null;
        readonly signalId: NodeID | null;
        /** closest note to inspected signal/owner on the owner structure */
        readonly treeWalkerOwnerId: NodeID | null;
    };
    type OutputChannels = {
        DebuggerEnabled: boolean;
        ResetPanel: void;
        InspectedState: InspectedState;
        InspectedNodeDetails: Mapped.OwnerDetails;
        StructureUpdates: StructureUpdates;
        NodeUpdates: NodeID[];
        InspectorUpdate: InspectorUpdate[];
        LocatorModeChange: boolean;
        HoveredComponent: {
            nodeId: NodeID;
            state: boolean;
        };
        InspectedComponent: NodeID;
        DgraphUpdate: DGraphUpdate;
    };
    type InputChannels = {
        ResetState: void;
        InspectNode: {
            ownerId: NodeID | null;
            signalId: NodeID | null;
        } | null;
        InspectValue: ToggleInspectedValueData;
        HighlightElementChange: HighlightElementPayload;
        OpenLocation: void;
        TreeViewModeChange: TreeWalkerMode;
        ViewChange: DevtoolsMainView;
        ToggleModule: {
            module: DebuggerModule;
            enabled: boolean;
        };
    };
}
declare const useDebugger: () => {
    meta: {
        versions: {
            readonly client: string | null;
            readonly solid: string | null;
            readonly expectedSolid: string | null;
        };
    };
    enabled: solid_js.Accessor<boolean>;
    toggleEnabled: (enabled: boolean) => undefined;
    on: _solid_primitives_event_bus.EmitterOn<Debugger.OutputChannels>;
    listen: _solid_primitives_event_bus.EmitterListen<Debugger.OutputChannels>;
    emit: <K extends keyof Debugger.InputChannels>(event: K, ..._: void extends Debugger.InputChannels[K] ? [payload?: Debugger.InputChannels[K] | undefined] : [payload: Debugger.InputChannels[K]]) => void;
};
declare const useLocator: (options: LocatorOptions) => void;

export { DevEventDataMap as A, StoredDevEvent as B, NodeID as C, DevEventType as D, EncodedValueMap as E, ValueItemID as F, getValueItemId as G, HighlightElementPayload as H, INFINITY as I, LocatorOptions as L, Mapped as M, NodeType as N, OnStoreNodeUpdate as O, PropGetterState as P, Solid as S, ToggleInspectedValueData as T, UNDEFINED as U, ValueUpdateListener as V, WINDOW_PROJECTPATH_PROPERTY as W, useLocator as a, DGraphUpdate as b, SerializedDGraph as c, Debugger as d, StructureUpdates as e, NEGATIVE_INFINITY as f, NAN as g, ValueType as h, EncodedValue as i, InspectorUpdateMap as j, InspectorUpdate as k, LOCATION_ATTRIBUTE_NAME as l, LocationAttr as m, LocatorComponent as n, SourceLocation as o, TargetIDE as p, TargetURLFunction as q, DevtoolsMainView as r, DEFAULT_MAIN_VIEW as s, DebuggerModule as t, useDebugger as u, TreeWalkerMode as v, DEFAULT_WALKER_MODE as w, NODE_TYPE_NAMES as x, ValueItemType as y, UNKNOWN as z };
