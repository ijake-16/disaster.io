import { makeEventListener } from '@solid-primitives/event-listener';
import { createHydratableSingletonRoot } from '@solid-primitives/rootless';
import { createHydratableStaticStore, createStaticStore } from '@solid-primitives/static-store';
import { noop, filterNonNullable, asArray, access, handleDiffArray } from '@solid-primitives/utils';
import { onCleanup, createEffect, sharedConfig } from 'solid-js';
import { isServer } from 'solid-js/web';

// src/index.ts
function makeResizeObserver(callback, options) {
  if (isServer) {
    return { observe: noop, unobserve: noop };
  }
  const observer = new ResizeObserver(callback);
  onCleanup(observer.disconnect.bind(observer));
  return {
    observe: (ref) => observer.observe(ref, options),
    unobserve: observer.unobserve.bind(observer)
  };
}
function createResizeObserver(targets, onResize, options) {
  if (isServer)
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
  createEffect((prev) => {
    const refs = filterNonNullable(asArray(access(targets)));
    handleDiffArray(refs, prev, observe, unobserve);
    return refs;
  }, []);
}
var WINDOW_SIZE_FALLBACK = { width: 0, height: 0 };
function getWindowSize() {
  if (isServer)
    return { ...WINDOW_SIZE_FALLBACK };
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}
function createWindowSize() {
  if (isServer) {
    return WINDOW_SIZE_FALLBACK;
  }
  const [size, setSize] = createHydratableStaticStore(WINDOW_SIZE_FALLBACK, getWindowSize);
  makeEventListener(window, "resize", () => setSize(getWindowSize()));
  return size;
}
var useWindowSize = /* @__PURE__ */ createHydratableSingletonRoot(createWindowSize);
var ELEMENT_SIZE_FALLBACK = { width: null, height: null };
function getElementSize(target) {
  if (isServer || !target) {
    return { ...ELEMENT_SIZE_FALLBACK };
  }
  const { width, height } = target.getBoundingClientRect();
  return { width, height };
}
function createElementSize(target) {
  if (isServer) {
    return ELEMENT_SIZE_FALLBACK;
  }
  const isFn = typeof target === "function";
  const [size, setSize] = createStaticStore(
    sharedConfig.context || isFn ? ELEMENT_SIZE_FALLBACK : getElementSize(target)
  );
  const ro = new ResizeObserver(([e]) => setSize(getElementSize(e.target)));
  onCleanup(() => ro.disconnect());
  if (isFn) {
    createEffect(() => {
      const el = target();
      if (el) {
        setSize(getElementSize(el));
        ro.observe(el);
        onCleanup(() => ro.unobserve(el));
      }
    });
  } else {
    ro.observe(target);
    onCleanup(() => ro.unobserve(target));
  }
  return size;
}

export { createElementSize, createResizeObserver, createWindowSize, getElementSize, getWindowSize, makeResizeObserver, useWindowSize };
