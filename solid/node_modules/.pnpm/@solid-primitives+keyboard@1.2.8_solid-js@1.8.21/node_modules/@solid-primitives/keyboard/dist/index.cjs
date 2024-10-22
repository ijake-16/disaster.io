'use strict';

var eventListener = require('@solid-primitives/event-listener');
var rootless = require('@solid-primitives/rootless');
var utils = require('@solid-primitives/utils');
var solidJs = require('solid-js');
var web = require('solid-js/web');

// src/index.ts
function equalsKeyHoldSequence(sequence, model) {
  for (let i = sequence.length - 1; i >= 0; i--) {
    const _model = model.slice(0, i + 1);
    if (!utils.arrayEquals(sequence[i], _model))
      return false;
  }
  return true;
}
exports.useKeyDownEvent = /* @__PURE__ */ rootless.createSingletonRoot(
  () => {
    if (web.isServer) {
      return () => null;
    }
    const [event, setEvent] = solidJs.createSignal(null);
    eventListener.makeEventListener(window, "keydown", (e) => {
      setEvent(e);
      setTimeout(() => setEvent(null));
    });
    return event;
  }
);
exports.useKeyDownList = /* @__PURE__ */ rootless.createSingletonRoot(() => {
  if (web.isServer) {
    const keys = () => [];
    keys[0] = keys;
    keys[1] = { event: () => null };
    keys[Symbol.iterator] = function* () {
      yield keys[0];
      yield keys[1];
    };
    return keys;
  }
  const [pressedKeys, setPressedKeys] = solidJs.createSignal([]), reset = () => setPressedKeys([]), event = exports.useKeyDownEvent();
  eventListener.makeEventListener(window, "keydown", (e) => {
    if (e.repeat || typeof e.key !== "string")
      return;
    const key = e.key.toUpperCase(), currentKeys = pressedKeys();
    if (currentKeys.includes(key))
      return;
    const keys = [...currentKeys, key];
    if (currentKeys.length === 0 && key !== "ALT" && key !== "CONTROL" && key !== "META" && key !== "SHIFT") {
      if (e.shiftKey)
        keys.unshift("SHIFT");
      if (e.altKey)
        keys.unshift("ALT");
      if (e.ctrlKey)
        keys.unshift("CONTROL");
      if (e.metaKey)
        keys.unshift("META");
    }
    setPressedKeys(keys);
  });
  eventListener.makeEventListener(window, "keyup", (e) => {
    if (typeof e.key !== "string")
      return;
    const key = e.key.toUpperCase();
    setPressedKeys((prev) => prev.filter((_key) => _key !== key));
  });
  eventListener.makeEventListener(window, "blur", reset);
  eventListener.makeEventListener(window, "contextmenu", (e) => {
    e.defaultPrevented || reset();
  });
  pressedKeys[0] = pressedKeys;
  pressedKeys[1] = { event };
  pressedKeys[Symbol.iterator] = function* () {
    yield pressedKeys[0];
    yield pressedKeys[1];
  };
  return pressedKeys;
});
exports.useCurrentlyHeldKey = /* @__PURE__ */ rootless.createSingletonRoot(
  () => {
    if (web.isServer) {
      return () => null;
    }
    const keys = exports.useKeyDownList();
    let prevKeys = solidJs.untrack(keys);
    return solidJs.createMemo(() => {
      const _keys = keys();
      const prev = prevKeys;
      prevKeys = _keys;
      if (prev.length === 0 && _keys.length === 1)
        return _keys[0];
      return null;
    });
  }
);
exports.useKeyDownSequence = /* @__PURE__ */ rootless.createSingletonRoot(() => {
  if (web.isServer) {
    return () => [];
  }
  const keys = exports.useKeyDownList();
  return solidJs.createMemo((prev) => {
    if (keys().length === 0)
      return [];
    return [...prev, keys()];
  }, []);
});
function createKeyHold(key, options = {}) {
  if (web.isServer) {
    return () => false;
  }
  key = key.toUpperCase();
  const { preventDefault = true } = options, event = exports.useKeyDownEvent(), heldKey = exports.useCurrentlyHeldKey();
  return solidJs.createMemo(() => heldKey() === key && (preventDefault && event()?.preventDefault(), true));
}
function createShortcut(keys, callback, options = {}) {
  if (web.isServer || !keys.length) {
    return;
  }
  keys = keys.map((key) => key.toUpperCase());
  const { preventDefault = true } = options, event = exports.useKeyDownEvent(), sequence = exports.useKeyDownSequence();
  let reset = false;
  const handleSequenceWithReset = (sequence2) => {
    if (!sequence2.length)
      return reset = false;
    if (reset)
      return;
    const e = event();
    if (sequence2.length < keys.length) {
      if (equalsKeyHoldSequence(sequence2, keys.slice(0, sequence2.length))) {
        preventDefault && e && e.preventDefault();
      } else {
        reset = true;
      }
    } else {
      reset = true;
      if (equalsKeyHoldSequence(sequence2, keys)) {
        preventDefault && e && e.preventDefault();
        callback(e);
      }
    }
  };
  const handleSequenceWithoutReset = (sequence2) => {
    const last = sequence2.at(-1);
    if (!last)
      return;
    const e = event();
    if (preventDefault && last.length < keys.length) {
      if (utils.arrayEquals(last, keys.slice(0, keys.length - 1))) {
        e && e.preventDefault();
      }
      return;
    }
    if (utils.arrayEquals(last, keys)) {
      const prev = sequence2.at(-2);
      if (!prev || utils.arrayEquals(prev, keys.slice(0, keys.length - 1))) {
        preventDefault && e && e.preventDefault();
        callback(e);
      }
    }
  };
  solidJs.createEffect(
    solidJs.on(sequence, options.requireReset ? handleSequenceWithReset : handleSequenceWithoutReset)
  );
}

exports.createKeyHold = createKeyHold;
exports.createShortcut = createShortcut;
