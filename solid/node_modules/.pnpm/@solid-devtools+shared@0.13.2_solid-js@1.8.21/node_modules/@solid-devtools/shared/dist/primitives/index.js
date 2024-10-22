import { makeEventListener } from '@solid-primitives/event-listener';
import { createMediaQuery } from '@solid-primitives/media';
import { createSingletonRoot } from '@solid-primitives/rootless';
import { tryOnCleanup } from '@solid-primitives/utils';
import { untrack, onCleanup, createSignal, createMemo, getOwner, equalFn, batch } from 'solid-js';

// src/primitives.ts
var untrackedCallback = (fn) => (...a) => untrack(fn.bind(void 0, ...a));
var useIsTouch = createSingletonRoot(() => createMediaQuery("(hover: none)"));
var useIsMobile = createSingletonRoot(() => createMediaQuery("(max-width: 640px)"));
function createHover(handle) {
  let state = false;
  let mounted = true;
  const mql = window.matchMedia("(hover: none)");
  let isTouch = mql.matches;
  makeEventListener(mql, "change", ({ matches }) => {
    if (isTouch = matches)
      handle(state = false);
  });
  onCleanup(() => {
    mounted = false;
    if (state)
      handle(state = false);
  });
  const onChange = (newState) => {
    if (isTouch || !mounted)
      return;
    state !== newState && handle(state = newState);
  };
  return {
    onMouseEnter: () => onChange(true),
    onMouseLeave: () => setTimeout(() => onChange(false))
  };
}
function createConsumers(initial = []) {
  const [consumers, setConsumers] = createSignal([...initial], { name: "consumers" });
  const enabled = createMemo(() => consumers().some((consumer) => consumer()));
  return [
    enabled,
    (consumer) => {
      setConsumers((p) => [...p, consumer]);
      tryOnCleanup(() => setConsumers((p) => p.filter((c) => c !== consumer)));
    }
  ];
}
function createDerivedSignal(fallback, options) {
  const [source, setSource] = createSignal();
  return [
    createMemo(
      () => {
        const sourceRef = source();
        return sourceRef ? sourceRef() : fallback;
      },
      void 0,
      options
    ),
    (newSource) => {
      if (newSource && getOwner())
        onCleanup(() => setSource((p) => p === newSource ? void 0 : p));
      return setSource(() => newSource);
    }
  ];
}
function makeHoverElementListener(onHover) {
  let last = null;
  const handleHover = (e) => {
    const { target } = e;
    if (target === last || !(target instanceof HTMLElement) && target !== null)
      return;
    onHover(last = target);
  };
  makeEventListener(window, "mouseover", handleHover);
  makeEventListener(document, "mouseleave", handleHover.bind(void 0, { target: null }));
}
function atom(initialValue, options) {
  let mutating = false;
  const equals = (options?.equals ?? equalFn) || (() => false);
  const [atom2, setter] = createSignal(initialValue, {
    ...options,
    equals: (a, b) => mutating ? mutating = false : equals(a, b)
  });
  atom2.update = setter;
  atom2.trigger = () => {
    mutating = true;
    setter((p) => p);
  };
  atom2.set = (value) => setter(() => value);
  atom2.peak = () => untrack(atom2);
  Object.defineProperty(atom2, "value", { get: atom2 });
  return atom2;
}
function createPingedSignal(timeout = 400) {
  const [isUpdated, setIsUpdated] = createSignal(false);
  let timeoutId;
  const ping = () => {
    setIsUpdated(true);
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => setIsUpdated(false), timeout);
  };
  onCleanup(() => clearTimeout(timeoutId));
  return [isUpdated, ping];
}
function handleTupleUpdate(handlers) {
  return (update) => handlers[update[0]](update[1]);
}
function handleTupleUpdates(handlers) {
  function runUpdates(updates) {
    for (const [key, value] of updates)
      handlers[key](value);
  }
  return (updates) => batch(runUpdates.bind(void 0, updates));
}

export { atom, createConsumers, createDerivedSignal, createHover, createPingedSignal, handleTupleUpdate, handleTupleUpdates, makeHoverElementListener, untrackedCallback, useIsMobile, useIsTouch };
