// src/main/constants.ts
var DevtoolsMainView = /* @__PURE__ */ ((DevtoolsMainView2) => {
  DevtoolsMainView2["Structure"] = "structure";
  return DevtoolsMainView2;
})(DevtoolsMainView || {});
var DEFAULT_MAIN_VIEW = "structure" /* Structure */;
var DebuggerModule = /* @__PURE__ */ ((DebuggerModule2) => {
  DebuggerModule2["Locator"] = "locator";
  DebuggerModule2["Structure"] = "structure";
  DebuggerModule2["Dgraph"] = "dgraph";
  return DebuggerModule2;
})(DebuggerModule || {});
var TreeWalkerMode = /* @__PURE__ */ ((TreeWalkerMode2) => {
  TreeWalkerMode2["Owners"] = "owners";
  TreeWalkerMode2["Components"] = "components";
  TreeWalkerMode2["DOM"] = "dom";
  return TreeWalkerMode2;
})(TreeWalkerMode || {});
var DEFAULT_WALKER_MODE = "components" /* Components */;
var NodeType = /* @__PURE__ */ ((NodeType2) => {
  NodeType2["Root"] = "root";
  NodeType2["Component"] = "component";
  NodeType2["Element"] = "element";
  NodeType2["Effect"] = "effect";
  NodeType2["Render"] = "render";
  NodeType2["Memo"] = "memo";
  NodeType2["Computation"] = "computation";
  NodeType2["Refresh"] = "refresh";
  NodeType2["Context"] = "context";
  NodeType2["CatchError"] = "catchError";
  NodeType2["Signal"] = "signal";
  NodeType2["Store"] = "store";
  return NodeType2;
})(NodeType || {});
var NODE_TYPE_NAMES = {
  ["root" /* Root */]: "Root",
  ["component" /* Component */]: "Component",
  ["element" /* Element */]: "Element",
  ["effect" /* Effect */]: "Effect",
  ["render" /* Render */]: "Render Effect",
  ["memo" /* Memo */]: "Memo",
  ["computation" /* Computation */]: "Computation",
  ["refresh" /* Refresh */]: "Refresh",
  ["context" /* Context */]: "Context",
  ["catchError" /* CatchError */]: "CatchError",
  ["signal" /* Signal */]: "Signal",
  ["store" /* Store */]: "Store"
};
var ValueItemType = /* @__PURE__ */ ((ValueItemType2) => {
  ValueItemType2["Signal"] = "signal";
  ValueItemType2["Prop"] = "prop";
  ValueItemType2["Value"] = "value";
  return ValueItemType2;
})(ValueItemType || {});
var UNKNOWN = "unknown";

// src/inspector/types.ts
var INFINITY = "Infinity";
var NEGATIVE_INFINITY = "NegativeInfinity";
var NAN = "NaN";
var UNDEFINED = "undefined";
var ValueType = /* @__PURE__ */ ((ValueType2) => {
  ValueType2["Number"] = "number";
  ValueType2["Boolean"] = "boolean";
  ValueType2["String"] = "string";
  ValueType2["Null"] = "null";
  ValueType2["Symbol"] = "symbol";
  ValueType2["Array"] = "array";
  ValueType2["Object"] = "object";
  ValueType2["Function"] = "function";
  ValueType2["Getter"] = "getter";
  ValueType2["Element"] = "element";
  ValueType2["Instance"] = "instance";
  ValueType2["Store"] = "store";
  ValueType2[ValueType2["Unknown"] = UNKNOWN] = "Unknown";
  return ValueType2;
})(ValueType || {});
var PropGetterState = /* @__PURE__ */ ((PropGetterState2) => {
  PropGetterState2["Live"] = "live";
  PropGetterState2["Stale"] = "stale";
  return PropGetterState2;
})(PropGetterState || {});

// src/locator/types.ts
var WINDOW_PROJECTPATH_PROPERTY = "$sdt_projectPath";
var LOCATION_ATTRIBUTE_NAME = "data-source-loc";

// src/main/types.ts
var DevEventType = /* @__PURE__ */ ((DevEventType2) => {
  DevEventType2["RootCreated"] = "RootCreated";
  return DevEventType2;
})(DevEventType || {});
var getValueItemId = (type, id) => {
  if (type === "value" /* Value */)
    return "value" /* Value */;
  return `${type}:${id}`;
};

export { DEFAULT_MAIN_VIEW, DEFAULT_WALKER_MODE, DebuggerModule, DevEventType, DevtoolsMainView, INFINITY, LOCATION_ATTRIBUTE_NAME, NAN, NEGATIVE_INFINITY, NODE_TYPE_NAMES, NodeType, PropGetterState, TreeWalkerMode, UNDEFINED, UNKNOWN, ValueItemType, ValueType, WINDOW_PROJECTPATH_PROPERTY, getValueItemId };
