'use strict';

var eventListener = require('@solid-primitives/event-listener');
var rootless = require('@solid-primitives/rootless');
var staticStore = require('@solid-primitives/static-store');
var utils = require('@solid-primitives/utils');
var solidJs = require('solid-js');
var web = require('solid-js/web');

// src/index.ts
function makeResizeObserver(callback, options) {
  if (web.isServer) {
    return { observe: utils.noop, unobserve: utils.noop };
  }
  const observer = new ResizeObserver(callback);
  solidJs.onCleanup(observer.disconnect.bind(observer));
  return {
    observe: (ref) => observer.observe(ref, options),
    unobserve: observer.unobserve.bind(observer)
  };
}
function createResizeObserver(targets, onResize, options) {
  if (web.isServer)
    return;
  const previousMap = /* @__PURE__ */ new WeakMap(), { observe, unobserve } = makeResizeObserver((entries) => {
    for (const entry of entries) {
      const { contentRect, target } = entry, width = Math.round(contentRect.width), height = Math.round(contentRect.height), previous = previousMap.get(target);
      if (!previous || previous.width !== width || previous.height !== height) {
        onResize(contentRect, target, entry);
        previousMap.set(target, { width, height });
      }
    }
  }, options);
  solidJs.createEffect((prev) => {
    const refs = utils.filterNonNullable(utils.asArray(utils.access(targets)));
    utils.handleDiffArray(refs, prev, observe, unobserve);
    return refs;
  }, []);
}
var WINDOW_SIZE_FALLBACK = { width: 0, height: 0 };
function getWindowSize() {
  if (web.isServer)
    return { ...WINDOW_SIZE_FALLBACK };
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}
function createWindowSize() {
  if (web.isServer) {
    return WINDOW_SIZE_FALLBACK;
  }
  const [size, setSize] = staticStore.createHydratableStaticStore(WINDOW_SIZE_FALLBACK, getWindowSize);
  eventListener.makeEventListener(window, "resize", () => setSize(getWindowSize()));
  return size;
}
exports.useWindowSize = /* @__PURE__ */ rootless.createHydratableSingletonRoot(createWindowSize);
var ELEMENT_SIZE_FALLBACK = { width: null, height: null };
function getElementSize(target) {
  if (web.isServer || !target) {
    return { ...ELEMENT_SIZE_FALLBACK };
  }
  const { width, height } = target.getBoundingClientRect();
  return { width, height };
}
function createElementSize(target) {
  if (web.isServer) {
    return ELEMENT_SIZE_FALLBACK;
  }
  const isFn = typeof target === "function";
  const [size, setSize] = staticStore.createStaticStore(
    solidJs.sharedConfig.context || isFn ? ELEMENT_SIZE_FALLBACK : getElementSize(target)
  );
  const ro = new ResizeObserver(([e]) => setSize(getElementSize(e.target)));
  solidJs.onCleanup(() => ro.disconnect());
  if (isFn) {
    solidJs.createEffect(() => {
      const el = target();
      if (el) {
        setSize(getElementSize(el));
        ro.observe(el);
        solidJs.onCleanup(() => ro.unobserve(el));
      }
    });
  } else {
    ro.observe(target);
    solidJs.onCleanup(() => ro.unobserve(target));
  }
  return size;
}

exports.createElementSize = createElementSize;
exports.createResizeObserver = createResizeObserver;
exports.createWindowSize = createWindowSize;
exports.getElementSize = getElementSize;
exports.getWindowSize = getWindowSize;
exports.makeResizeObserver = makeResizeObserver;
