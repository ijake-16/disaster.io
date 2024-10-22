var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../../node_modules/.pnpm/solid-js@1.8.5/node_modules/solid-js/dist/solid.js
var sharedConfig = {
  context: void 0,
  registry: void 0
};
var equalFn = (a, b) => a === b;
var $PROXY = Symbol("solid-proxy");
var signalOptions = {
  equals: equalFn
};
var runEffects = runQueue;
var STALE = 1;
var PENDING = 2;
var UNOWNED = {
  owned: null,
  cleanups: null,
  context: null,
  owner: null
};
var Owner = null;
var Transition = null;
var Listener = null;
var Updates = null;
var Effects = null;
var ExecCount = 0;
function createRoot(fn, detachedOwner) {
  const listener = Listener, owner = Owner, unowned = fn.length === 0, current = detachedOwner === void 0 ? owner : detachedOwner, root = unowned ? UNOWNED : {
    owned: null,
    cleanups: null,
    context: current ? current.context : null,
    owner: current
  }, updateFn = unowned ? fn : () => fn(() => untrack(() => cleanNode(root)));
  Owner = root;
  Listener = null;
  try {
    return runUpdates(updateFn, true);
  } finally {
    Listener = listener;
    Owner = owner;
  }
}
function createSignal(value, options) {
  options = options ? Object.assign({}, signalOptions, options) : signalOptions;
  const s = {
    value,
    observers: null,
    observerSlots: null,
    comparator: options.equals || void 0
  };
  const setter = (value2) => {
    if (typeof value2 === "function") {
      value2 = value2(s.value);
    }
    return writeSignal(s, value2);
  };
  return [readSignal.bind(s), setter];
}
function createComputed(fn, value, options) {
  const c = createComputation(fn, value, true, STALE);
  updateComputation(c);
}
function createRenderEffect(fn, value, options) {
  const c = createComputation(fn, value, false, STALE);
  updateComputation(c);
}
function createEffect(fn, value, options) {
  runEffects = runUserEffects;
  const c = createComputation(fn, value, false, STALE);
  if (!options || !options.render)
    c.user = true;
  Effects ? Effects.push(c) : updateComputation(c);
}
function createMemo(fn, value, options) {
  options = options ? Object.assign({}, signalOptions, options) : signalOptions;
  const c = createComputation(fn, value, true, 0);
  c.observers = null;
  c.observerSlots = null;
  c.comparator = options.equals || void 0;
  updateComputation(c);
  return readSignal.bind(c);
}
function batch(fn) {
  return runUpdates(fn, false);
}
function untrack(fn) {
  if (Listener === null)
    return fn();
  const listener = Listener;
  Listener = null;
  try {
    return fn();
  } finally {
    Listener = listener;
  }
}
function onMount(fn) {
  createEffect(() => untrack(fn));
}
function onCleanup(fn) {
  if (Owner === null)
    ;
  else if (Owner.cleanups === null)
    Owner.cleanups = [fn];
  else
    Owner.cleanups.push(fn);
  return fn;
}
function getListener() {
  return Listener;
}
function getOwner() {
  return Owner;
}
function runWithOwner(o, fn) {
  const prev = Owner;
  const prevListener = Listener;
  Owner = o;
  Listener = null;
  try {
    return runUpdates(fn, true);
  } catch (err) {
    handleError(err);
  } finally {
    Owner = prev;
    Listener = prevListener;
  }
}
function readSignal() {
  if (this.sources && (this.state)) {
    if ((this.state) === STALE)
      updateComputation(this);
    else {
      const updates = Updates;
      Updates = null;
      runUpdates(() => lookUpstream(this), false);
      Updates = updates;
    }
  }
  if (Listener) {
    const sSlot = this.observers ? this.observers.length : 0;
    if (!Listener.sources) {
      Listener.sources = [this];
      Listener.sourceSlots = [sSlot];
    } else {
      Listener.sources.push(this);
      Listener.sourceSlots.push(sSlot);
    }
    if (!this.observers) {
      this.observers = [Listener];
      this.observerSlots = [Listener.sources.length - 1];
    } else {
      this.observers.push(Listener);
      this.observerSlots.push(Listener.sources.length - 1);
    }
  }
  return this.value;
}
function writeSignal(node, value, isComp) {
  let current = node.value;
  if (!node.comparator || !node.comparator(current, value)) {
    node.value = value;
    if (node.observers && node.observers.length) {
      runUpdates(() => {
        for (let i = 0; i < node.observers.length; i += 1) {
          const o = node.observers[i];
          const TransitionRunning = Transition && Transition.running;
          if (TransitionRunning && Transition.disposed.has(o))
            ;
          if (TransitionRunning ? !o.tState : !o.state) {
            if (o.pure)
              Updates.push(o);
            else
              Effects.push(o);
            if (o.observers)
              markDownstream(o);
          }
          if (!TransitionRunning)
            o.state = STALE;
        }
        if (Updates.length > 1e6) {
          Updates = [];
          if (false)
            ;
          throw new Error();
        }
      }, false);
    }
  }
  return value;
}
function updateComputation(node) {
  if (!node.fn)
    return;
  cleanNode(node);
  const owner = Owner, listener = Listener, time = ExecCount;
  Listener = Owner = node;
  runComputation(node, node.value, time);
  Listener = listener;
  Owner = owner;
}
function runComputation(node, value, time) {
  let nextValue;
  try {
    nextValue = node.fn(value);
  } catch (err) {
    if (node.pure) {
      {
        node.state = STALE;
        node.owned && node.owned.forEach(cleanNode);
        node.owned = null;
      }
    }
    node.updatedAt = time + 1;
    return handleError(err);
  }
  if (!node.updatedAt || node.updatedAt <= time) {
    if (node.updatedAt != null && "observers" in node) {
      writeSignal(node, nextValue);
    } else node.value = nextValue;
    node.updatedAt = time;
  }
}
function createComputation(fn, init, pure, state = STALE, options) {
  const c = {
    fn,
    state,
    updatedAt: null,
    owned: null,
    sources: null,
    sourceSlots: null,
    cleanups: null,
    value: init,
    owner: Owner,
    context: Owner ? Owner.context : null,
    pure
  };
  if (Owner === null)
    ;
  else if (Owner !== UNOWNED) {
    {
      if (!Owner.owned)
        Owner.owned = [c];
      else
        Owner.owned.push(c);
    }
  }
  return c;
}
function runTop(node) {
  if ((node.state) === 0)
    return;
  if ((node.state) === PENDING)
    return lookUpstream(node);
  if (node.suspense && untrack(node.suspense.inFallback))
    return node.suspense.effects.push(node);
  const ancestors = [node];
  while ((node = node.owner) && (!node.updatedAt || node.updatedAt < ExecCount)) {
    if (node.state)
      ancestors.push(node);
  }
  for (let i = ancestors.length - 1; i >= 0; i--) {
    node = ancestors[i];
    if ((node.state) === STALE) {
      updateComputation(node);
    } else if ((node.state) === PENDING) {
      const updates = Updates;
      Updates = null;
      runUpdates(() => lookUpstream(node, ancestors[0]), false);
      Updates = updates;
    }
  }
}
function runUpdates(fn, init) {
  if (Updates)
    return fn();
  let wait = false;
  if (!init)
    Updates = [];
  if (Effects)
    wait = true;
  else
    Effects = [];
  ExecCount++;
  try {
    const res = fn();
    completeUpdates(wait);
    return res;
  } catch (err) {
    if (!wait)
      Effects = null;
    Updates = null;
    handleError(err);
  }
}
function completeUpdates(wait) {
  if (Updates) {
    runQueue(Updates);
    Updates = null;
  }
  if (wait)
    return;
  const e = Effects;
  Effects = null;
  if (e.length)
    runUpdates(() => runEffects(e), false);
}
function runQueue(queue) {
  for (let i = 0; i < queue.length; i++)
    runTop(queue[i]);
}
function runUserEffects(queue) {
  let i, userLength = 0;
  for (i = 0; i < queue.length; i++) {
    const e = queue[i];
    if (!e.user)
      runTop(e);
    else
      queue[userLength++] = e;
  }
  for (i = 0; i < userLength; i++)
    runTop(queue[i]);
}
function lookUpstream(node, ignore) {
  node.state = 0;
  for (let i = 0; i < node.sources.length; i += 1) {
    const source = node.sources[i];
    if (source.sources) {
      const state = source.state;
      if (state === STALE) {
        if (source !== ignore && (!source.updatedAt || source.updatedAt < ExecCount))
          runTop(source);
      } else if (state === PENDING)
        lookUpstream(source, ignore);
    }
  }
}
function markDownstream(node) {
  for (let i = 0; i < node.observers.length; i += 1) {
    const o = node.observers[i];
    if (!o.state) {
      o.state = PENDING;
      if (o.pure)
        Updates.push(o);
      else
        Effects.push(o);
      o.observers && markDownstream(o);
    }
  }
}
function cleanNode(node) {
  let i;
  if (node.sources) {
    while (node.sources.length) {
      const source = node.sources.pop(), index = node.sourceSlots.pop(), obs = source.observers;
      if (obs && obs.length) {
        const n2 = obs.pop(), s = source.observerSlots.pop();
        if (index < obs.length) {
          n2.sourceSlots[s] = index;
          obs[index] = n2;
          source.observerSlots[index] = s;
        }
      }
    }
  }
  if (node.owned) {
    for (i = node.owned.length - 1; i >= 0; i--)
      cleanNode(node.owned[i]);
    node.owned = null;
  }
  if (node.cleanups) {
    for (i = node.cleanups.length - 1; i >= 0; i--)
      node.cleanups[i]();
    node.cleanups = null;
  }
  node.state = 0;
}
function castError(err) {
  if (err instanceof Error)
    return err;
  return new Error(typeof err === "string" ? err : "Unknown error", {
    cause: err
  });
}
function handleError(err, owner = Owner) {
  const error2 = castError(err);
  throw error2;
}
function createComponent(Comp, props) {
  return untrack(() => Comp(props || {}));
}
var narrowedError = (name) => `Stale read from <${name}>.`;
function Show(props) {
  const keyed = props.keyed;
  const condition = createMemo(() => props.when, void 0, {
    equals: (a, b) => keyed ? a === b : !a === !b
  });
  return createMemo(() => {
    const c = condition();
    if (c) {
      const child = props.children;
      const fn = typeof child === "function" && child.length > 0;
      return fn ? untrack(() => child(keyed ? c : () => {
        if (!untrack(condition))
          throw narrowedError("Show");
        return props.when;
      })) : child;
    }
    return props.fallback;
  }, void 0, void 0);
}
function reconcileArrays(parentNode, a, b) {
  let bLength = b.length, aEnd = a.length, bEnd = bLength, aStart = 0, bStart = 0, after = a[aEnd - 1].nextSibling, map = null;
  while (aStart < aEnd || bStart < bEnd) {
    if (a[aStart] === b[bStart]) {
      aStart++;
      bStart++;
      continue;
    }
    while (a[aEnd - 1] === b[bEnd - 1]) {
      aEnd--;
      bEnd--;
    }
    if (aEnd === aStart) {
      const node = bEnd < bLength ? bStart ? b[bStart - 1].nextSibling : b[bEnd - bStart] : after;
      while (bStart < bEnd)
        parentNode.insertBefore(b[bStart++], node);
    } else if (bEnd === bStart) {
      while (aStart < aEnd) {
        if (!map || !map.has(a[aStart]))
          a[aStart].remove();
        aStart++;
      }
    } else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
      const node = a[--aEnd].nextSibling;
      parentNode.insertBefore(b[bStart++], a[aStart++].nextSibling);
      parentNode.insertBefore(b[--bEnd], node);
      a[aEnd] = b[bEnd];
    } else {
      if (!map) {
        map = /* @__PURE__ */ new Map();
        let i = bStart;
        while (i < bEnd)
          map.set(b[i], i++);
      }
      const index = map.get(a[aStart]);
      if (index != null) {
        if (bStart < index && index < bEnd) {
          let i = aStart, sequence = 1, t;
          while (++i < aEnd && i < bEnd) {
            if ((t = map.get(a[i])) == null || t !== index + sequence)
              break;
            sequence++;
          }
          if (sequence > index - bStart) {
            const node = a[aStart];
            while (bStart < index)
              parentNode.insertBefore(b[bStart++], node);
          } else
            parentNode.replaceChild(b[bStart++], a[aStart++]);
        } else
          aStart++;
      } else
        a[aStart++].remove();
    }
  }
}
function template(html, isCE, isSVG) {
  let node;
  const create = () => {
    const t = document.createElement("template");
    t.innerHTML = html;
    return isSVG ? t.content.firstChild.firstChild : t.content.firstChild;
  };
  const fn = isCE ? () => untrack(() => document.importNode(node || (node = create()), true)) : () => (node || (node = create())).cloneNode(true);
  fn.cloneNode = fn;
  return fn;
}
function className(node, value) {
  if (value == null)
    node.removeAttribute("class");
  else
    node.className = value;
}
function insert(parent, accessor, marker, initial) {
  if (marker !== void 0 && !initial)
    initial = [];
  if (typeof accessor !== "function")
    return insertExpression(parent, accessor, initial, marker);
  createRenderEffect((current) => insertExpression(parent, accessor(), current, marker), initial);
}
function insertExpression(parent, value, current, marker, unwrapArray) {
  while (typeof current === "function")
    current = current();
  if (value === current)
    return current;
  const t = typeof value, multi = marker !== void 0;
  parent = multi && current[0] && current[0].parentNode || parent;
  if (t === "string" || t === "number") {
    if (t === "number")
      value = value.toString();
    if (multi) {
      let node = current[0];
      if (node && node.nodeType === 3) {
        node.data = value;
      } else
        node = document.createTextNode(value);
      current = cleanChildren(parent, current, marker, node);
    } else {
      if (current !== "" && typeof current === "string") {
        current = parent.firstChild.data = value;
      } else
        current = parent.textContent = value;
    }
  } else if (value == null || t === "boolean") {
    current = cleanChildren(parent, current, marker);
  } else if (t === "function") {
    createRenderEffect(() => {
      let v = value();
      while (typeof v === "function")
        v = v();
      current = insertExpression(parent, v, current, marker);
    });
    return () => current;
  } else if (Array.isArray(value)) {
    const array = [];
    const currentArray = current && Array.isArray(current);
    if (normalizeIncomingArray(array, value, current, unwrapArray)) {
      createRenderEffect(() => current = insertExpression(parent, array, current, marker, true));
      return () => current;
    }
    if (array.length === 0) {
      current = cleanChildren(parent, current, marker);
      if (multi)
        return current;
    } else if (currentArray) {
      if (current.length === 0) {
        appendNodes(parent, array, marker);
      } else
        reconcileArrays(parent, current, array);
    } else {
      current && cleanChildren(parent);
      appendNodes(parent, array);
    }
    current = array;
  } else if (value.nodeType) {
    if (Array.isArray(current)) {
      if (multi)
        return current = cleanChildren(parent, current, marker, value);
      cleanChildren(parent, current, null, value);
    } else if (current == null || current === "" || !parent.firstChild) {
      parent.appendChild(value);
    } else
      parent.replaceChild(value, parent.firstChild);
    current = value;
  } else
    ;
  return current;
}
function normalizeIncomingArray(normalized, array, current, unwrap) {
  let dynamic = false;
  for (let i = 0, len = array.length; i < len; i++) {
    let item = array[i], prev = current && current[i], t;
    if (item == null || item === true || item === false)
      ;
    else if ((t = typeof item) === "object" && item.nodeType) {
      normalized.push(item);
    } else if (Array.isArray(item)) {
      dynamic = normalizeIncomingArray(normalized, item, prev) || dynamic;
    } else if (t === "function") {
      if (unwrap) {
        while (typeof item === "function")
          item = item();
        dynamic = normalizeIncomingArray(normalized, Array.isArray(item) ? item : [item], Array.isArray(prev) ? prev : [prev]) || dynamic;
      } else {
        normalized.push(item);
        dynamic = true;
      }
    } else {
      const value = String(item);
      if (prev && prev.nodeType === 3 && prev.data === value)
        normalized.push(prev);
      else
        normalized.push(document.createTextNode(value));
    }
  }
  return dynamic;
}
function appendNodes(parent, array, marker = null) {
  for (let i = 0, len = array.length; i < len; i++)
    parent.insertBefore(array[i], marker);
}
function cleanChildren(parent, current, marker, replacement) {
  if (marker === void 0)
    return parent.textContent = "";
  const node = replacement || document.createTextNode("");
  if (current.length) {
    let inserted = false;
    for (let i = current.length - 1; i >= 0; i--) {
      const el = current[i];
      if (node !== el) {
        const isParent = el.parentNode === parent;
        if (!inserted && !i)
          isParent ? parent.replaceChild(node, el) : parent.insertBefore(node, marker);
        else
          isParent && el.remove();
      } else
        inserted = true;
    }
  } else
    parent.insertBefore(node, marker);
  return [node];
}
var SVG_NAMESPACE = "http://www.w3.org/2000/svg";
function createElement(tagName, isSVG = false) {
  return isSVG ? document.createElementNS(SVG_NAMESPACE, tagName) : document.createElement(tagName);
}
function Portal(props) {
  const {
    useShadow
  } = props, marker = document.createTextNode(""), mount = () => props.mount || document.body, owner = getOwner();
  let content;
  let hydrating = !!sharedConfig.context;
  createEffect(() => {
    content || (content = runWithOwner(owner, () => createMemo(() => props.children)));
    const el = mount();
    if (el instanceof HTMLHeadElement) {
      const [clean, setClean] = createSignal(false);
      const cleanup = () => setClean(true);
      createRoot((dispose) => insert(el, () => !clean() ? content() : dispose(), null));
      onCleanup(cleanup);
    } else {
      const container = createElement(props.isSVG ? "g" : "div", props.isSVG), renderRoot = useShadow && container.attachShadow ? container.attachShadow({
        mode: "open"
      }) : container;
      Object.defineProperty(container, "_$host", {
        get() {
          return marker.parentNode;
        },
        configurable: true
      });
      insert(renderRoot, content);
      el.appendChild(container);
      props.ref && props.ref(container);
      onCleanup(() => el.removeChild(container));
    }
  }, void 0, {
    render: !hydrating
  });
  return marker;
}
var noop = () => void 0;
var trueFn = () => true;
function isObject(value) {
  return value !== null && (typeof value === "object" || typeof value === "function");
}
var isNonNullable = (i) => i != null;
var filterNonNullable = (arr) => arr.filter(isNonNullable);
function chain(callbacks) {
  return (...args) => {
    for (const callback of callbacks)
      callback && callback(...args);
  };
}
var access = (v) => typeof v === "function" && !v.length ? v() : v;
var asArray = (value) => Array.isArray(value) ? value : value ? [value] : [];
function accessWith(valueOrFn, ...args) {
  return typeof valueOrFn === "function" ? valueOrFn(...args) : valueOrFn;
}
function defer(deps, fn, initialValue) {
  const isArray = Array.isArray(deps);
  let prevInput;
  let shouldDefer = true;
  return (prevValue) => {
    let input;
    if (isArray) {
      input = Array(deps.length);
      for (let i = 0; i < deps.length; i++)
        input[i] = deps[i]();
    } else
      input = deps();
    if (shouldDefer) {
      shouldDefer = false;
      prevInput = input;
      return initialValue;
    }
    const result = untrack(() => fn(input, prevInput, prevValue));
    prevInput = input;
    return result;
  };
}
var tryOnCleanup = onCleanup;
function createMicrotask(fn) {
  let calls = 0;
  let args;
  onCleanup(() => calls = 0);
  return (...a) => {
    args = a, calls++;
    queueMicrotask(() => --calls === 0 && fn(...args));
  };
}
function createHydratableSignal(serverValue, update, options) {
  return createSignal(update(), options);
}
function handleDiffArray(current, prev, handleAdded, handleRemoved) {
  const currLength = current.length;
  const prevLength = prev.length;
  let i = 0;
  if (!prevLength) {
    for (; i < currLength; i++)
      handleAdded(current[i]);
    return;
  }
  if (!currLength) {
    for (; i < prevLength; i++)
      handleRemoved(prev[i]);
    return;
  }
  for (; i < prevLength; i++) {
    if (prev[i] !== current[i])
      break;
  }
  let prevEl;
  let currEl;
  prev = prev.slice(i);
  current = current.slice(i);
  for (prevEl of prev) {
    if (!current.includes(prevEl))
      handleRemoved(prevEl);
  }
  for (currEl of current) {
    if (!prev.includes(currEl))
      handleAdded(currEl);
  }
}

// ../../node_modules/.pnpm/@solid-primitives+event-bus@1.0.8_solid-js@1.8.5/node_modules/@solid-primitives/event-bus/dist/index.js
var EventBusCore = class extends Set {
  emit(payload) {
    for (const cb of this)
      cb(payload);
  }
};
function createEventBus() {
  const bus = new EventBusCore();
  return {
    listen(listener) {
      bus.add(listener);
      return tryOnCleanup(bus.delete.bind(bus, listener));
    },
    emit: bus.emit.bind(bus),
    clear: onCleanup(bus.clear.bind(bus))
  };
}
var EmitterCore = class extends Map {
  on(event, listener) {
    let bus = this.get(event);
    bus || this.set(event, bus = new EventBusCore());
    bus.add(listener);
  }
  off(event, listener) {
    const bus = this.get(event);
    bus?.delete(listener) && !bus.size && this.delete(event);
  }
  emit(event, value) {
    this.get(event)?.emit(value);
  }
};
function createEmitter() {
  const emitter = new EmitterCore();
  return {
    on(event, listener) {
      emitter.on(event, listener);
      return tryOnCleanup(emitter.off.bind(emitter, event, listener));
    },
    emit: emitter.emit.bind(emitter),
    clear: onCleanup(emitter.clear.bind(emitter))
  };
}
function createGlobalEmitter() {
  const emitter = createEmitter();
  const global = createEventBus();
  return {
    on: emitter.on,
    clear: emitter.clear,
    listen: global.listen,
    emit(name, details) {
      global.emit({ name, details });
      emitter.emit(name, details);
    }
  };
}

// ../../node_modules/.pnpm/@solid-primitives+static-store@0.0.5_solid-js@1.8.5/node_modules/@solid-primitives/static-store/dist/index.js
function createStaticStore(init) {
  const copy = { ...init }, store = { ...init }, cache = {};
  const getValue = (key) => {
    let signal = cache[key];
    if (!signal) {
      if (!getListener())
        return copy[key];
      cache[key] = signal = createSignal(copy[key], { internal: true });
      delete copy[key];
    }
    return signal[0]();
  };
  for (const key in init) {
    Object.defineProperty(store, key, { get: () => getValue(key), enumerable: true });
  }
  const setValue = (key, value) => {
    const signal = cache[key];
    if (signal)
      return signal[1](value);
    if (key in copy)
      copy[key] = accessWith(value, [copy[key]]);
  };
  return [
    store,
    (a, b) => {
      if (isObject(a)) {
        const entries3 = untrack(
          () => Object.entries(accessWith(a, store))
        );
        batch(() => {
          for (const [key, value] of entries3)
            setValue(key, () => value);
        });
      } else
        setValue(a, b);
      return store;
    }
  ];
}
function createDerivedStaticStore(fn, value, options) {
  const o = getOwner(), fnMemo = createMemo(fn, value, options), store = { ...untrack(fnMemo) }, cache = {};
  for (const key in store)
    Object.defineProperty(store, key, {
      get() {
        let keyMemo = cache[key];
        if (!keyMemo) {
          if (!getListener())
            return fnMemo()[key];
          runWithOwner(o, () => cache[key] = keyMemo = createMemo(() => fnMemo()[key]));
        }
        return keyMemo();
      },
      enumerable: true
    });
  return store;
}

// ../../node_modules/.pnpm/@solid-primitives+scheduled@1.4.1_solid-js@1.8.5/node_modules/@solid-primitives/scheduled/dist/index.js
var throttle = (callback, wait) => {
  let isThrottled = false, timeoutId, lastArgs;
  const throttled = (...args) => {
    lastArgs = args;
    if (isThrottled)
      return;
    isThrottled = true;
    timeoutId = setTimeout(() => {
      callback(...lastArgs);
      isThrottled = false;
    }, wait);
  };
  const clear = () => {
    clearTimeout(timeoutId);
    isThrottled = false;
  };
  if (getOwner())
    onCleanup(clear);
  return Object.assign(throttled, { clear });
};
var scheduleIdle = (
  // requestIdleCallback is not supported in Safari
  window.requestIdleCallback ? (callback, maxWait) => {
    let isDeferred = false, id, lastArgs;
    const deferred = (...args) => {
      lastArgs = args;
      if (isDeferred)
        return;
      isDeferred = true;
      id = requestIdleCallback(
        () => {
          callback(...lastArgs);
          isDeferred = false;
        },
        { timeout: maxWait }
      );
    };
    const clear = () => {
      cancelIdleCallback(id);
      isDeferred = false;
    };
    if (getOwner())
      onCleanup(clear);
    return Object.assign(deferred, { clear });
  } : (
    // fallback to setTimeout (throttle)
    (callback) => throttle(callback)
  )
);
var DEFAULT_WALKER_MODE = "components" /* Components */;

// src/main/get-id.ts
var LastId = 0;
var getNewSdtId = () => `#${(LastId++).toString(36)}`;

// src/main/id.ts
var WeakIdMap = /* @__PURE__ */ new WeakMap();
var RefMapMap = {
  ["owner" /* Owner */]: /* @__PURE__ */ new Map(),
  ["element" /* Element */]: /* @__PURE__ */ new Map(),
  ["signal" /* Signal */]: /* @__PURE__ */ new Map(),
  ["store" /* Store */]: /* @__PURE__ */ new Map(),
  ["store-node" /* StoreNode */]: /* @__PURE__ */ new Map()
};
var CleanupRegistry = new FinalizationRegistry((data) => {
  RefMapMap[data.map].delete(data.id);
});
function getSdtId(obj, objType) {
  let id = WeakIdMap.get(obj);
  if (!id) {
    id = getNewSdtId();
    WeakIdMap.set(obj, id);
    RefMapMap[objType].set(id, new WeakRef(obj));
    CleanupRegistry.register(obj, { map: objType, id });
  }
  return id;
}
function getObjectById(id, objType) {
  const ref = RefMapMap[objType].get(id);
  return ref?.deref() ?? null;
}

// ../shared/dist/chunk/AJRIPJTI.js
var getLogLabel = () => [
  `%csolid-devtools`,
  "color: #fff; background: #2c4f7c; padding: 1px 4px;"
];
function warn(...args) {
  console.warn(...getLogLabel(), ...args);
  return;
}
function trimString(str, maxLength) {
  if (str.length <= maxLength)
    return str;
  return str.slice(0, maxLength) + "\u2026";
}

// src/main/solid-api.ts
if (!globalThis.SolidDevtools$$) {
  throw new Error(
    `[solid-devtools]: Debugger hasn't found the exposed Solid Devtools API. Did you import the setup script?`
  );
}
var SolidApi = globalThis.SolidDevtools$$;
var solid_api_default = SolidApi;

// src/main/utils.ts
var $NODE = solid_api_default.STORE_DEV.$NODE;
var isObject2 = (o) => typeof o === "object" && !!o;
var isSolidOwner = (o) => "owned" in o;
var isSolidComputation = (o) => !!o.fn;
var isObservableComputation = (o) => !!o.fn && o.context === null;
var isSolidRoot = (o) => !("fn" in o);
var isSolidMemo = (o) => "fn" in o && "comparator" in o;
var isSolidComponent = (o) => "component" in o;
var isStoreNode = (o) => $NODE in o;
var isSolidStore = (o) => !("observers" in o) && "value" in o && isObject2(o.value) && $PROXY in o.value;
var isSolidSignal = (o) => "value" in o && "observers" in o && "observerSlots" in o && "comparator" in o;
function getNodeType(o) {
  if (isSolidOwner(o))
    return getOwnerType(o);
  return isSolidStore(o) ? "store" /* Store */ : "signal" /* Signal */;
}
var SOLID_REFRESH_PREFIX = "[solid-refresh]";
var getOwnerType = (o) => {
  if (typeof o.sdtType !== "undefined")
    return o.sdtType;
  if (!isSolidComputation(o)) {
    if ("sources" in o)
      return "catchError" /* CatchError */;
    return "root" /* Root */;
  }
  if (isSolidComponent(o))
    return "component" /* Component */;
  if ("comparator" in o) {
    if (
      // eslint-disable-next-line @typescript-eslint/ban-types
      o.owner?.component?.name.startsWith(
        SOLID_REFRESH_PREFIX
      )
    ) {
      return "refresh" /* Refresh */;
    }
    return "memo" /* Memo */;
  }
  if (!o.pure) {
    if (o.user === true)
      return "effect" /* Effect */;
    if (o.context !== null && (!o.owner || o.owner.context !== o.context))
      return "context" /* Context */;
    return "render" /* Render */;
  }
  return "computation" /* Computation */;
};
var getNodeName = (o) => {
  if (!o.name)
    return;
  let name = o.name;
  if (name.startsWith(SOLID_REFRESH_PREFIX))
    name = name.slice(SOLID_REFRESH_PREFIX.length);
  return trimString(name, 20);
};
function markOwnerType(o) {
  if (o.sdtType !== void 0)
    return o.sdtType;
  return o.sdtType = getOwnerType(o);
}
function isDisposed(o) {
  return !!(isSolidComputation(o) ? o.owner && (!o.owner.owned || !o.owner.owned.includes(o)) : o.isDisposed);
}
function getComponentRefreshNode(owner) {
  const { owned } = owner;
  let refresh;
  if (owned && owned.length === 1 && markOwnerType(refresh = owned[0]) === "refresh" /* Refresh */) {
    return refresh;
  }
  return null;
}
function resolveElements(value) {
  const resolved = getResolvedElements(value);
  if (Array.isArray(resolved))
    return resolved.length ? resolved : null;
  return resolved ? [resolved] : null;
}
function getResolvedElements(value) {
  if (typeof value === "function" && !value.length && value.name === "bound readSignal")
    return getResolvedElements(value());
  if (Array.isArray(value)) {
    const results = [];
    for (const item of value) {
      const result = getResolvedElements(item);
      if (result)
        Array.isArray(result) ? results.push.apply(results, result) : results.push(result);
    }
    return results;
  }
  return value instanceof HTMLElement ? value : null;
}
function lookupOwner(owner, predicate) {
  do {
    if (predicate(owner))
      return owner;
    owner = owner.owner;
  } while (owner.owner);
  return null;
}
function onOwnerCleanup(owner, fn, prepend = false, symbol) {
  if (owner.cleanups === null)
    owner.cleanups = [fn];
  else {
    if (symbol) {
      if (owner.cleanups.some((c) => c[symbol])) {
        return () => owner.cleanups?.splice(
          owner.cleanups.findIndex((c) => c[symbol]),
          1
        );
      }
      fn[symbol] = true;
    }
    if (prepend)
      owner.cleanups.unshift(fn);
    else
      owner.cleanups.push(fn);
  }
  return () => owner.cleanups?.splice(owner.cleanups.indexOf(fn), 1);
}
function onParentCleanup(owner, fn, prepend = false, symbol) {
  if (owner.owner)
    return onOwnerCleanup(owner.owner, fn, prepend, symbol);
  return () => {
  };
}
function onOwnerDispose(owner, fn, prepend = false, symbol) {
  if (isSolidRoot(owner))
    return onOwnerCleanup(owner, fn, prepend, symbol);
  return onParentCleanup(owner, fn, prepend, symbol);
}
function createBatchedUpdateEmitter(emit) {
  const updates = /* @__PURE__ */ new Set();
  const triggerUpdateEmit = throttle(() => {
    emit([...updates]);
    updates.clear();
  });
  return (update) => {
    updates.add(update);
    triggerUpdateEmit();
  };
}

// src/main/component-registry.ts
var $CLEANUP = Symbol("component-registry-cleanup");
var ComponentMap = /* @__PURE__ */ new Map();
var ElementNodeMap = /* @__PURE__ */ new Map();
function cleanupComponent(nodeID) {
  const component = ComponentMap.get(nodeID);
  if (!component)
    return;
  component.cleanup();
  ComponentMap.delete(nodeID);
  for (const element of component.elementNodes)
    ElementNodeMap.delete(element);
}
function registerComponent(data) {
  if ("elementId" in data) {
    const { componentId, elementId, element } = data;
    const component = ComponentMap.get(componentId);
    if (!component)
      return;
    component.elementNodes.add(elementId);
    ElementNodeMap.set(elementId, { el: element, component });
  } else {
    const { owner, id, name, elements: elementsList } = data;
    if (!elementsList)
      return cleanupComponent(id);
    const set = new Set(elementsList);
    const existing = ComponentMap.get(id);
    if (existing) {
      existing.elements = set;
      return;
    }
    const cleanup = onOwnerCleanup(owner, () => cleanupComponent(id), false, $CLEANUP);
    ComponentMap.set(id, {
      id,
      owner,
      name,
      elements: set,
      cleanup,
      elementNodes: /* @__PURE__ */ new Set()
    });
  }
}
function clearComponentRegistry() {
  for (const component of ComponentMap.values())
    component.cleanup();
  ComponentMap.clear();
  ElementNodeMap.clear();
}
function getComponent(id) {
  const component = ComponentMap.get(id);
  if (component)
    return { name: component.name, elements: [...component.elements], id };
  const elData = ElementNodeMap.get(id);
  return elData ? { name: elData.component.name, id: elData.component.id, elements: [elData.el] } : null;
}
function findComponent(el) {
  const including = /* @__PURE__ */ new Map();
  let currEl = el;
  while (currEl) {
    for (const component of ComponentMap.values()) {
      if (component.elements.has(currEl))
        including.set(component.owner, component);
    }
    currEl = including.size === 0 ? currEl.parentElement : null;
  }
  if (including.size > 1) {
    for (const owner of including.keys()) {
      if (!including.has(owner))
        continue;
      let currOwner = owner.owner;
      while (currOwner) {
        const deleted = including.delete(currOwner);
        if (deleted)
          break;
        currOwner = currOwner.owner;
      }
    }
  }
  if (including.size === 0)
    return null;
  const { name, id } = including.values().next().value;
  return { name, id };
}

// src/main/roots.ts
var RootMap = /* @__PURE__ */ new Map();
var getCurrentRoots = () => RootMap.values();
var OnOwnerNeedsUpdate;
function setOnOwnerNeedsUpdate(fn) {
  OnOwnerNeedsUpdate = fn;
}
var OnRootRemoved;
function setOnRootRemoved(fn) {
  OnRootRemoved = fn;
}
function createTopRoot(owner) {
  const rootId = getSdtId(owner, "owner" /* Owner */);
  RootMap.set(rootId, owner);
  OnOwnerNeedsUpdate?.(owner, rootId);
}
function cleanupRoot(root) {
  const rootId = getSdtId(root, "owner" /* Owner */);
  root.isDisposed = true;
  changeRootAttachment(root, null);
  const wasTarcked = RootMap.delete(rootId);
  if (wasTarcked)
    OnRootRemoved?.(rootId);
}
function changeRootAttachment(root, newParent) {
  let topRoot;
  if (root.attachedTo) {
    root.attachedTo.sdtSubRoots.splice(root.attachedTo.sdtSubRoots.indexOf(root), 1);
    topRoot = getTopRoot(root.attachedTo);
    if (topRoot)
      OnOwnerNeedsUpdate?.(root.attachedTo, getSdtId(topRoot, "owner" /* Owner */));
  }
  if (newParent) {
    root.attachedTo = newParent;
    if (newParent.sdtSubRoots)
      newParent.sdtSubRoots.push(root);
    else
      newParent.sdtSubRoots = [root];
    if (topRoot === void 0)
      topRoot = getTopRoot(newParent);
    if (topRoot)
      OnOwnerNeedsUpdate?.(newParent, getSdtId(topRoot, "owner" /* Owner */));
  } else {
    delete root.attachedTo;
  }
}
var InternalRootCount = 0;
function attachDebugger(owner = solid_api_default.getOwner()) {
  if (InternalRootCount)
    return;
  if (!owner)
    return warn("reatachOwner helper should be called synchronously in a reactive owner.");
  const roots = [];
  let isFirstTopLevel = true;
  while (owner) {
    if (isSolidRoot(owner)) {
      if (owner.isInternal || owner.isDisposed)
        return;
      if (RootMap.has(getSdtId(owner, "owner" /* Owner */))) {
        isFirstTopLevel = false;
        break;
      }
      roots.push(owner);
    }
    owner = owner.owner;
  }
  for (let i = roots.length - 1; i >= 0; i--) {
    const root = roots[i];
    root.sdtType = "root" /* Root */;
    onOwnerCleanup(root, () => cleanupRoot(root), true);
    const isTopLevel = isFirstTopLevel && i === 0;
    if (isTopLevel) {
      createTopRoot(root);
      return;
    }
    let parent = findClosestAliveParent(root);
    if (!parent.owner)
      return warn("Parent owner is missing.");
    changeRootAttachment(root, parent.owner);
    const onParentCleanup2 = () => {
      const newParent = findClosestAliveParent(root);
      changeRootAttachment(root, newParent.owner);
      if (newParent.owner) {
        parent = newParent;
        onOwnerCleanup(parent.root, onParentCleanup2);
      } else {
        removeOwnCleanup();
        createTopRoot(root);
      }
    };
    const removeParentCleanup = onOwnerCleanup(parent.root, onParentCleanup2);
    const removeOwnCleanup = onOwnerCleanup(root, removeParentCleanup);
  }
}
function unobserveAllRoots() {
  RootMap.forEach((r) => cleanupRoot(r));
  clearComponentRegistry();
}
var createInternalRoot = (fn, detachedOwner) => {
  InternalRootCount++;
  const r = solid_api_default.createRoot((dispose) => {
    solid_api_default.getOwner().isInternal = true;
    return fn(dispose);
  }, detachedOwner);
  InternalRootCount--;
  return r;
};
function getTopRoot(owner) {
  let root = null;
  do {
    if (isSolidRoot(owner) && !owner.isInternal && !owner.isDisposed)
      root = owner;
    owner = owner.owner;
  } while (owner);
  return root;
}
function findClosestAliveParent(owner) {
  let disposed = null;
  let closestAliveRoot = null;
  let current = owner;
  while (current.owner && !closestAliveRoot) {
    current = current.owner;
    if (isSolidRoot(current)) {
      if (current.isDisposed)
        disposed = current;
      else
        closestAliveRoot = current;
    }
  }
  if (!closestAliveRoot)
    return { owner: null, root: null };
  return { owner: (disposed ?? owner).owner, root: closestAliveRoot };
}

// src/main/observe.ts
for (const e of solid_api_default.getDevEvents()) {
  switch (e.type) {
    case "RootCreated" /* RootCreated */:
      attachDebugger(e.data);
      break;
  }
}
solid_api_default.DEV.hooks.afterCreateOwner = function(owner) {
  if (isSolidRoot(owner)) {
    attachDebugger(owner);
  }
};
var GraphUpdateListeners = /* @__PURE__ */ new Set();
solid_api_default.DEV.hooks.afterUpdate = chain(GraphUpdateListeners);
function addSolidUpdateListener(onUpdate) {
  GraphUpdateListeners.add(onUpdate);
  return () => GraphUpdateListeners.delete(onUpdate);
}
function interceptComputationRerun(owner, onRun) {
  const _fn = owner.fn;
  let v;
  let prev;
  const fn = () => v = _fn(prev);
  owner.fn = !!owner.fn.length ? (p) => {
    onRun(fn, prev = p);
    return v;
  } : () => {
    onRun(fn, void 0);
    return v;
  };
}
var ComputationUpdateListeners = /* @__PURE__ */ new WeakMap();
function observeComputationUpdate(owner, onRun, symbol = Symbol()) {
  let map = ComputationUpdateListeners.get(owner);
  if (!map)
    ComputationUpdateListeners.set(owner, map = {});
  map[symbol] = onRun;
  interceptComputationRerun(owner, (fn) => {
    fn();
    for (const sym of Object.getOwnPropertySymbols(map))
      map[sym]();
  });
}
function removeComputationUpdateObserver(owner, symbol) {
  const map = ComputationUpdateListeners.get(owner);
  if (map)
    delete map[symbol];
}
var SignalUpdateListeners = /* @__PURE__ */ new WeakMap();
function observeValueUpdate(node, onUpdate, symbol) {
  let map = SignalUpdateListeners.get(node);
  if (!map) {
    SignalUpdateListeners.set(node, map = /* @__PURE__ */ new Map());
    let value = node.value;
    Object.defineProperty(node, "value", {
      get: () => value,
      set: (newValue) => {
        for (const fn of map.values())
          fn(newValue, value);
        value = newValue;
      }
    });
  }
  map.set(symbol, onUpdate);
}
function removeValueUpdateObserver(node, symbol) {
  SignalUpdateListeners.get(node)?.delete(symbol);
}
function makeValueUpdateListener(node, onUpdate, symbol) {
  observeValueUpdate(node, onUpdate, symbol);
  tryOnCleanup(() => removeValueUpdateObserver(node, symbol));
}

// src/inspector/types.ts
var INFINITY = "Infinity";
var NEGATIVE_INFINITY = "NegativeInfinity";
var NAN = "NaN";
var UNDEFINED = "undefined";

// src/locator/types.ts
var WINDOW_PROJECTPATH_PROPERTY = "$sdt_projectPath";
var LOCATION_ATTRIBUTE_NAME = "data-source-loc";

// src/dependency/collect.ts
var $DGRAPH = Symbol("dependency-graph");
var Graph;
var VisitedSources;
var VisitedObservers;
var DepthMap;
var OnNodeUpdate;
function observeNodeUpdate(node, handler) {
  if (isSolidOwner(node))
    observeComputationUpdate(node, handler, $DGRAPH);
  else
    observeValueUpdate(node, handler, $DGRAPH);
}
function unobserveNodeUpdate(node) {
  if (isSolidOwner(node))
    removeComputationUpdateObserver(node, $DGRAPH);
  else
    removeValueUpdateObserver(node, $DGRAPH);
}
function addNodeToGraph(node) {
  const isOwner = isSolidOwner(node);
  const id = getSdtId(node, isOwner ? "owner" /* Owner */ : "signal" /* Signal */);
  if (Graph[id])
    return;
  const onNodeUpdate = OnNodeUpdate;
  observeNodeUpdate(node, () => onNodeUpdate(id));
  Graph[id] = {
    name: getNodeName(node),
    type: getNodeType(node),
    depth: lookupDepth(node),
    sources: "sources" in node && node.sources ? node.sources.map(
      (n2) => getSdtId(n2, isSolidOwner(n2) ? "owner" /* Owner */ : "signal" /* Signal */)
    ) : void 0,
    observers: "observers" in node && node.observers ? node.observers.map((n2) => getSdtId(n2, "owner" /* Owner */)) : void 0,
    graph: !isOwner && node.graph ? getSdtId(node.graph, "owner" /* Owner */) : void 0
  };
}
function visitSources(node) {
  let n2 = 0;
  if ("sources" in node && node.sources) {
    for (const source of node.sources) {
      const isOwner = isSolidOwner(source);
      if (isOwner && getOwnerType(source) === "refresh" /* Refresh */)
        continue;
      n2++;
      if (VisitedSources.has(source))
        continue;
      VisitedSources.add(source);
      if (isOwner && visitSources(source) === 0) {
        n2--;
        continue;
      }
      addNodeToGraph(source);
    }
  }
  return n2;
}
function visitObservers(node) {
  if ("observers" in node && node.observers) {
    for (const observer of node.observers) {
      if (VisitedObservers.has(observer) || getOwnerType(observer) === "refresh" /* Refresh */) {
        continue;
      }
      VisitedObservers.add(observer);
      addNodeToGraph(observer);
      visitObservers(observer);
    }
  }
}
function lookupDepth(node) {
  const id = getSdtId(node, isSolidOwner(node) ? "owner" /* Owner */ : "signal" /* Signal */);
  if (id in DepthMap)
    return DepthMap[id];
  let owner;
  if (!("owned" in node))
    owner = node.graph;
  else if (!("fn" in node) && !node.owner)
    return 0;
  else
    owner = node.owner;
  return DepthMap[id] = owner ? lookupDepth(owner) + 1 : 0;
}
function collectDependencyGraph(node, config) {
  const graph = Graph = {};
  const visitedSources = VisitedSources = /* @__PURE__ */ new Set();
  const visitedObservers = VisitedObservers = /* @__PURE__ */ new Set();
  DepthMap = {};
  OnNodeUpdate = config.onNodeUpdate;
  addNodeToGraph(node);
  visitSources(node);
  visitObservers(node);
  const clearListeners = () => {
    visitedSources.forEach(unobserveNodeUpdate);
    visitedObservers.forEach(unobserveNodeUpdate);
    unobserveNodeUpdate(node);
  };
  Graph = VisitedObservers = VisitedSources = DepthMap = OnNodeUpdate = void 0;
  return { graph, clearListeners };
}

// src/dependency/index.ts
function createDependencyGraph(props) {
  let clearListeners = null;
  const onNodeUpdate = (id) => {
    queueMicrotask(() => {
      if (!props.enabled())
        return;
      props.onNodeUpdate(id);
      triggerInspect();
    });
  };
  const inspectedNode = createMemo(() => {
    const state = props.inspectedState();
    if (state.signalId) {
      return getObjectById(state.signalId, "signal" /* Signal */);
    } else if (state.ownerId) {
      return getObjectById(state.ownerId, "owner" /* Owner */);
    }
    return null;
  });
  function inspectDGraph() {
    clearListeners?.();
    const node = inspectedNode();
    const type = node && getNodeType(node);
    if (!props.enabled() || !type || type === "root" /* Root */ || type === "component" /* Component */ || type === "context" /* Context */) {
      clearListeners = null;
      props.emit("DgraphUpdate", null);
      return;
    }
    const dgraph = collectDependencyGraph(node, {
      onNodeUpdate
    });
    clearListeners = dgraph.clearListeners;
    props.emit("DgraphUpdate", dgraph.graph);
  }
  const triggerInspect = throttle(inspectDGraph, 200);
  createEffect(
    defer([props.enabled, inspectedNode], () => {
      queueMicrotask(inspectDGraph);
    })
  );
  props.listenToViewChange(() => {
    inspectDGraph();
  });
}

// ../../node_modules/.pnpm/@nothing-but+utils@0.12.0/node_modules/@nothing-but/utils/dist/misc.js
var misc_exports = {};
__export(misc_exports, {
  chain: () => chain2,
  entries: () => entries2,
  false_fn: () => false_fn,
  is_non_nullable: () => is_non_nullable,
  is_of_class: () => is_of_class,
  is_plain_object: () => is_plain_object,
  keys: () => keys2,
  noop: () => noop2,
  reverse_chain: () => reverse_chain,
  toError: () => toError,
  true_fn: () => true_fn,
  xor: () => xor
});
var noop2 = () => void 0;
var true_fn = () => true;
var false_fn = () => false;
var xor = (a, b) => a ? !b : b;
var entries2 = Object.entries;
var keys2 = Object.keys;
var toError = (e) => e instanceof Error ? e : new Error(String(e));
var is_plain_object = (value) => value && Object.getPrototypeOf(value) === Object.prototype;
var is_of_class = (v, c) => v instanceof c || v && v.constructor === c;
var is_non_nullable = (i) => i != null;
function chain2(callbacks) {
  return (...args) => {
    for (const callback of callbacks)
      callback && void callback(...args);
  };
}
function reverse_chain(callbacks) {
  return (...args) => {
    for (let i = callbacks.length - 1; i >= 0; i--) {
      const callback = callbacks[i];
      callback && void callback(...args);
    }
  };
}

// ../../node_modules/.pnpm/@solid-primitives+event-listener@2.3.0_solid-js@1.8.5/node_modules/@solid-primitives/event-listener/dist/index.js
function makeEventListener(target, type, handler, options) {
  target.addEventListener(type, handler, options);
  return tryOnCleanup(target.removeEventListener.bind(target, type, handler, options));
}

// ../../node_modules/.pnpm/@solid-primitives+rootless@1.4.2_solid-js@1.8.5/node_modules/@solid-primitives/rootless/dist/index.js
function createSingletonRoot(factory, detachedOwner = getOwner()) {
  let listeners = 0, value, disposeRoot;
  return () => {
    listeners++;
    onCleanup(() => {
      listeners--;
      queueMicrotask(() => {
        if (!listeners && disposeRoot) {
          disposeRoot();
          disposeRoot = value = void 0;
        }
      });
    });
    if (!disposeRoot) {
      createRoot((dispose) => value = factory(disposeRoot = dispose), detachedOwner);
    }
    return value;
  };
}
function createHydratableSingletonRoot(factory) {
  const owner = getOwner();
  const singleton = createSingletonRoot(factory, owner);
  return () => singleton();
}
function createRootPool(factory, options = {}) {
  let length = 0;
  const { limit = 100 } = options, pool = new Array(limit), owner = getOwner(), mapRoot = factory.length > 1 ? (dispose, [args, set]) => {
    const [active, setA] = createSignal(true);
    const root = {
      dispose,
      set,
      setA,
      active,
      v: factory(args, active, () => disposeRoot(root))
    };
    return root;
  } : (dispose, [args, set]) => ({
    dispose,
    set,
    setA: trueFn,
    active: trueFn,
    v: factory(args, trueFn, noop)
  }), limitPool = createMicrotask(() => {
    if (length > limit) {
      for (let i = limit; i < length; i++) {
        pool[i].dispose();
        pool[i] = void 0;
      }
      length = limit;
    }
  }), cleanupRoot2 = (root) => {
    if (root.dispose !== noop) {
      pool[length++] = root;
      root.setA(false);
      limitPool();
    }
  }, disposeRoot = (root) => {
    root.dispose();
    root.dispose = noop;
    if (root.active())
      root.setA(false);
    else {
      pool[pool.indexOf(root)] = pool[--length];
      pool[length] = void 0;
    }
  };
  onCleanup(() => {
    for (let i = 0; i < length; i++)
      pool[i].dispose();
    length = 0;
  });
  return (arg) => {
    let root;
    if (length) {
      root = pool[--length];
      pool[length] = void 0;
      batch(() => {
        root.set(() => arg);
        root.setA(true);
      });
    } else
      root = createRoot((dispose) => mapRoot(dispose, createSignal(arg)), owner);
    onCleanup(() => cleanupRoot2(root));
    return root.v;
  };
}

// ../../node_modules/.pnpm/@solid-primitives+media@2.2.5_solid-js@1.8.5/node_modules/@solid-primitives/media/dist/index.js
function createMediaQuery(query, serverFallback = false) {
  const mql = window.matchMedia(query);
  const [state, setState] = createHydratableSignal(serverFallback, () => mql.matches);
  const update = () => setState(mql.matches);
  makeEventListener(mql, "change", update);
  return state;
}
function createPrefersDark(serverFallback) {
  return createMediaQuery("(prefers-color-scheme: dark)", serverFallback);
}
/* @__PURE__ */ createHydratableSingletonRoot(
  createPrefersDark.bind(void 0, false)
);

// ../shared/dist/primitives/index.js
var untrackedCallback = (fn) => (...a) => untrack(fn.bind(void 0, ...a));
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

// ../../node_modules/.pnpm/@solid-primitives+keyboard@1.2.5_solid-js@1.8.5/node_modules/@solid-primitives/keyboard/dist/index.js
var useKeyDownEvent = /* @__PURE__ */ createSingletonRoot(
  () => {
    const [event, setEvent] = createSignal(null);
    makeEventListener(window, "keydown", (e) => {
      setEvent(e);
      setTimeout(() => setEvent(null));
    });
    return event;
  }
);
var useKeyDownList = /* @__PURE__ */ createSingletonRoot(() => {
  const [pressedKeys, setPressedKeys] = createSignal([]), reset2 = () => setPressedKeys([]), event = useKeyDownEvent();
  makeEventListener(window, "keydown", (e) => {
    if (e.repeat || typeof e.key !== "string")
      return;
    const key = e.key.toUpperCase(), currentKeys = pressedKeys();
    if (currentKeys.includes(key))
      return;
    const keys3 = [...currentKeys, key];
    if (currentKeys.length === 0 && key !== "ALT" && key !== "CONTROL" && key !== "META" && key !== "SHIFT") {
      if (e.shiftKey)
        keys3.unshift("SHIFT");
      if (e.altKey)
        keys3.unshift("ALT");
      if (e.ctrlKey)
        keys3.unshift("CONTROL");
      if (e.metaKey)
        keys3.unshift("META");
    }
    setPressedKeys(keys3);
  });
  makeEventListener(window, "keyup", (e) => {
    if (typeof e.key !== "string")
      return;
    const key = e.key.toUpperCase();
    setPressedKeys((prev) => prev.filter((_key) => _key !== key));
  });
  makeEventListener(window, "blur", reset2);
  makeEventListener(window, "contextmenu", (e) => {
    e.defaultPrevented || reset2();
  });
  pressedKeys[0] = pressedKeys;
  pressedKeys[1] = { event };
  pressedKeys[Symbol.iterator] = function* () {
    yield pressedKeys[0];
    yield pressedKeys[1];
  };
  return pressedKeys;
});
var useCurrentlyHeldKey = /* @__PURE__ */ createSingletonRoot(
  () => {
    const keys3 = useKeyDownList();
    let prevKeys = untrack(keys3);
    return createMemo(() => {
      const _keys = keys3();
      const prev = prevKeys;
      prevKeys = _keys;
      if (prev.length === 0 && _keys.length === 1)
        return _keys[0];
      return null;
    });
  }
);
function createKeyHold(key, options = {}) {
  key = key.toUpperCase();
  const { preventDefault = true } = options, event = useKeyDownEvent(), heldKey = useCurrentlyHeldKey();
  return createMemo(() => heldKey() === key && (preventDefault && event()?.preventDefault(), true));
}

// ../../node_modules/.pnpm/@solid-primitives+resize-observer@2.0.22_solid-js@1.8.5/node_modules/@solid-primitives/resize-observer/dist/index.js
function makeResizeObserver(callback, options) {
  const observer = new ResizeObserver(callback);
  onCleanup(observer.disconnect.bind(observer));
  return {
    observe: (ref) => observer.observe(ref, options),
    unobserve: observer.unobserve.bind(observer)
  };
}
function createResizeObserver(targets, onResize, options) {
  const previousMap = /* @__PURE__ */ new WeakMap(), { observe, unobserve } = makeResizeObserver((entries3) => {
    for (const entry of entries3) {
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

// ../../node_modules/.pnpm/@solid-primitives+bounds@0.0.118_solid-js@1.8.5/node_modules/@solid-primitives/bounds/dist/index.js
var NULLED_BOUNDS = {
  top: null,
  left: null,
  bottom: null,
  right: null,
  width: null,
  height: null
};
function getElementBounds(element) {
  if (!element) {
    return { ...NULLED_BOUNDS };
  }
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    bottom: rect.bottom,
    right: rect.right,
    width: rect.width,
    height: rect.height
  };
}
function createElementBounds(target, { trackMutation = true, trackResize = true, trackScroll = true } = {}) {
  const isFn = typeof target === "function", [track, trigger] = createSignal(void 0, { equals: false });
  let calc;
  if (isFn) {
    calc = () => getElementBounds(target());
    onMount(trigger);
  } else
    calc = () => getElementBounds(target);
  const bounds = createDerivedStaticStore(() => (track(), calc()));
  if (trackResize) {
    createResizeObserver(
      isFn ? () => target() || [] : target,
      typeof trackResize === "function" ? trackResize(trigger) : trigger
    );
  }
  if (trackScroll) {
    const scrollHandler = isFn ? (e) => {
      const el = target();
      el && e.target instanceof Node && e.target.contains(el) && trigger();
    } : (e) => e.target instanceof Node && e.target.contains(target) && trigger();
    makeEventListener(
      window,
      "scroll",
      typeof trackScroll === "function" ? trackScroll(scrollHandler) : scrollHandler,
      { capture: true }
    );
  }
  if (trackMutation) {
    const mo = new MutationObserver(
      typeof trackMutation === "function" ? trackMutation(trigger) : trigger
    );
    mo.observe(document.body, {
      attributeFilter: ["style", "class"],
      subtree: true,
      childList: true
    });
    onCleanup(() => mo.disconnect());
  }
  return bounds;
}

// ../../node_modules/.pnpm/@solid-primitives+cursor@0.0.112_solid-js@1.8.5/node_modules/@solid-primitives/cursor/dist/index.js
function createElementCursor(target, cursor) {
  createEffect(() => {
    const el = access(target);
    const cursorValue = access(cursor);
    if (!el)
      return;
    const overwritten = el.style.cursor;
    el.style.setProperty("cursor", cursorValue, "important");
    onCleanup(() => el.style.cursor = overwritten);
  });
}

// src/locator/element-overlay.tsx
var _tmpl$ = /* @__PURE__ */ template(`<div>`);
var _tmpl$2 = /* @__PURE__ */ template(`<style>`);
var _tmpl$3 = /* @__PURE__ */ template(`<div><div class=name-animated-container><div class=name-background></div><div class=name-text>: <span></span></div><div class=name-invisible>: `);
var _tmpl$4 = /* @__PURE__ */ template(`<div class=element-overlay><div class=border>`);
function createElementsOverlay(selected) {
  const useElementOverlay = createRootPool((component, active) => createComponent(ElementOverlay, {
    get component() {
      return createMemo(() => !!active())() ? component() : null;
    }
  }));
  const owner = getOwner();
  setTimeout(() => {
    runWithOwner(owner, () => createComponent(Portal, {
      useShadow: true,
      get mount() {
        return document.documentElement;
      },
      get children() {
        const _el$ = _tmpl$();
        insert(_el$, () => selected().map(useElementOverlay));
        return _el$;
      }
    }));
  }, 1e3);
}
var ElementOverlay = (props) => {
  const element = () => props.component?.element;
  createElementCursor(element, "pointer");
  const tag = () => element()?.localName;
  const name = () => props.component?.name;
  const bounds = createElementBounds(element);
  const left = createMemo((prev) => bounds.left === null ? prev : bounds.left, 0);
  const top = createMemo((prev) => bounds.top === null ? prev : bounds.top, 0);
  const width = createMemo((prev) => bounds.width === null ? prev : bounds.width, 0);
  const height = createMemo((prev) => bounds.height === null ? prev : bounds.height, 0);
  const transform = createMemo(() => `translate(${Math.round(left())}px, ${Math.round(top())}px)`);
  const placeOnTop = createMemo(() => top() > window.innerHeight / 2);
  return [(() => {
    const _el$2 = _tmpl$2();
    insert(_el$2, styles);
    return _el$2;
  })(), (() => {
    const _el$3 = _tmpl$4(); _el$3.firstChild;
    insert(_el$3, createComponent(Show, {
      get when() {
        return name();
      },
      get children() {
        const _el$5 = _tmpl$3(), _el$6 = _el$5.firstChild, _el$7 = _el$6.firstChild, _el$8 = _el$7.nextSibling, _el$9 = _el$8.firstChild, _el$10 = _el$9.nextSibling, _el$11 = _el$8.nextSibling, _el$12 = _el$11.firstChild;
        insert(_el$8, name, _el$9);
        insert(_el$10, tag);
        insert(_el$11, name, _el$12);
        insert(_el$11, tag, null);
        createRenderEffect(() => className(_el$5, `name-container ${placeOnTop() ? "top" : "bottom"}`));
        return _el$5;
      }
    }), null);
    createRenderEffect((_p$) => {
      const _v$ = transform(), _v$2 = width() + "px", _v$3 = height() + "px";
      _v$ !== _p$._v$ && ((_p$._v$ = _v$) != null ? _el$3.style.setProperty("transform", _v$) : _el$3.style.removeProperty("transform"));
      _v$2 !== _p$._v$2 && ((_p$._v$2 = _v$2) != null ? _el$3.style.setProperty("width", _v$2) : _el$3.style.removeProperty("width"));
      _v$3 !== _p$._v$3 && ((_p$._v$3 = _v$3) != null ? _el$3.style.setProperty("height", _v$3) : _el$3.style.removeProperty("height"));
      return _p$;
    }, {
      _v$: void 0,
      _v$2: void 0,
      _v$3: void 0
    });
    return _el$3;
  })()];
};
var styles = (
  /*css*/
  `
.element-overlay {
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  pointer-events: none;
  transition-duration: 100ms;
  transition-property: transform, width, height;
  --color: 14 116 144;
}
.border {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 2px solid rgb(var(--color) / 0.8);
  background-color: rgb(var(--color) / 0.3);
  border-radius: 0.25rem;
}
.name-container {
  position: absolute;
  z-index: 10000;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  color: white;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1rem;
}
.name-container.bottom {
  top: 100%;
}
.name-container.top {
  bottom: 100%;
}
.name-animated-container {
  position: relative;
  margin: 0.5rem auto;
  padding: 0.25rem 0.5rem;
}
.name-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgb(var(--color) / 0.8);
  border-radius: 0.25rem;
}
.name-text {
  position: absolute;
}
.name-text span {
  color: #a5f3fc;
}
.name-invisible {
  visibility: hidden;
  width: max-content;
}
`
);

// ../../node_modules/.pnpm/@solid-primitives+platform@0.1.0_solid-js@1.8.5/node_modules/@solid-primitives/platform/dist/index.js
var w = window;
var n = w.navigator;
var ua = n.userAgent;
var isWindows = /* @__PURE__ */ /(win32|win64|windows|wince)/i.test(ua);
!!w.opr && !!w.opr.addons || !!w.opera || /* @__PURE__ */ / OPR\//.test(ua);
!!n.vendor && n.vendor.includes("Apple") && ua && !ua.includes("CriOS") && !ua.includes("FxiOS");
!!n.brave && n.brave.isBrave && n.brave.isBrave.name === "isBrave";

// src/locator/find-components.ts
var LOC_ATTR_REGEX_WIN = /^((?:\\?[^\s][^/\\:\"\?\*<>\|]+)+):([0-9]+):([0-9]+)$/;
var LOC_ATTR_REGEX_UNIX = /^((?:(?:\.\/|\.\.\/|\/)?(?:\.?\w+\/)*)(?:\.?\w+\.?\w+)):([0-9]+):([0-9]+)$/;
var LOC_ATTR_REGEX = isWindows ? LOC_ATTR_REGEX_WIN : LOC_ATTR_REGEX_UNIX;
function getLocationAttr(element) {
  const attr = element.getAttribute(LOCATION_ATTRIBUTE_NAME);
  if (!attr || !LOC_ATTR_REGEX.test(attr))
    return;
  return attr;
}
var targetIDEMap = {
  vscode: ({ projectPath, file, line, column }) => `vscode://file/${projectPath}/${file}:${line}:${column}`,
  "vscode-insiders": ({ projectPath, file: filePath, line, column }) => `vscode-insiders://file/${projectPath}/${filePath}:${line}:${column}`,
  atom: ({ projectPath, file: filePath, line, column }) => `atom://core/open/file?filename=${projectPath}/${filePath}&line=${line}&column=${column}`,
  webstorm: ({ projectPath, file: filePath, line, column }) => `webstorm://open?file=${projectPath}/${filePath}&line=${line}&column=${column}`
};
function getTargetURL(target, data) {
  if (typeof target === "function")
    return target(data);
  return targetIDEMap[target](data);
}
var getProjectPath = () => window[WINDOW_PROJECTPATH_PROPERTY];
function getSourceCodeData(location, element) {
  const projectPath = getProjectPath();
  if (!projectPath)
    return;
  const parsed = parseLocationString(location);
  if (!parsed)
    return;
  return { ...parsed, projectPath, element };
}
function parseLocationString(location) {
  let [filePath, line, column] = location.split(":");
  if (filePath && line && column && typeof filePath === "string" && !isNaN(line = Number(line)) && !isNaN(column = Number(column))) {
    return { file: filePath, line, column };
  }
}
function openSourceCode(target, data) {
  const url = getTargetURL(target, data);
  if (typeof url === "string")
    window.open(url, "_blank");
}

// src/locator/index.ts
function createLocator(props) {
  const [enabledByPressingSignal, setEnabledByPressingSignal] = createSignal(() => false);
  props.setLocatorEnabledSignal(createMemo(() => enabledByPressingSignal()()));
  const [hoverTarget, setHoverTarget] = createSignal(null);
  const [devtoolsTarget, setDevtoolsTarget] = createSignal(null);
  const [highlightedComponents, setHighlightedComponents] = createSignal([]);
  const calcHighlightedComponents = (target) => {
    if (!target)
      return [];
    if ("type" in target && target.type === "element") {
      const element = getObjectById(target.id, "element" /* Element */);
      if (!(element instanceof HTMLElement))
        return [];
      target = element;
    }
    if (target instanceof HTMLElement) {
      const comp2 = findComponent(target);
      if (!comp2)
        return [];
      return [
        {
          location: getLocationAttr(target),
          element: target,
          id: comp2.id,
          name: comp2.name
        }
      ];
    }
    const comp = getComponent(target.id);
    if (!comp)
      return [];
    return comp.elements.map((element) => ({
      element,
      id: comp.id,
      name: comp.name
    }));
  };
  createEffect(
    defer(
      () => hoverTarget() ?? devtoolsTarget(),
      scheduleIdle(
        (target) => setHighlightedComponents(() => calcHighlightedComponents(target))
      )
    )
  );
  createElementsOverlay(highlightedComponents);
  createEffect((prev) => {
    const target = hoverTarget();
    const comp = target && findComponent(target);
    if (prev)
      props.emit("HoveredComponent", { nodeId: prev, state: false });
    if (comp) {
      const { id } = comp;
      props.emit("HoveredComponent", { nodeId: id, state: true });
      return id;
    }
  });
  let targetIDE;
  createEffect(() => {
    if (!props.locatorEnabled())
      return;
    makeHoverElementListener((el) => setHoverTarget(el));
    onCleanup(() => setHoverTarget(null));
    makeEventListener(
      window,
      "click",
      (e) => {
        const { target } = e;
        if (!(target instanceof HTMLElement))
          return;
        const highlighted = highlightedComponents();
        const comp = highlighted.find(({ element }) => target.contains(element)) ?? highlighted[0];
        if (!comp)
          return;
        const sourceCodeData = comp.location && getSourceCodeData(comp.location, comp.element);
        props.onComponentClick(comp.id, () => {
          if (!targetIDE || !sourceCodeData)
            return;
          e.preventDefault();
          e.stopPropagation();
          openSourceCode(targetIDE, sourceCodeData);
        });
      },
      true
    );
  });
  let locatorUsed = false;
  const owner = getOwner();
  function useLocator2(options) {
    runWithOwner(owner, () => {
      if (locatorUsed)
        return warn("useLocator can be called only once.");
      locatorUsed = true;
      if (options.targetIDE)
        targetIDE = options.targetIDE;
      if (options.key !== false) {
        const isHoldingKey = createKeyHold(options.key ?? "Alt", { preventDefault: true });
        setEnabledByPressingSignal(() => isHoldingKey);
      }
    });
  }
  if (solid_api_default.locatorOptions) {
    useLocator2(solid_api_default.locatorOptions);
  }
  return {
    useLocator: useLocator2,
    setDevtoolsHighlightTarget(target) {
      setDevtoolsTarget(target);
    },
    openElementSourceCode(location, element) {
      if (!targetIDE)
        return warn("Please set `targetIDE` it in useLocator options.");
      const projectPath = getProjectPath();
      if (!projectPath)
        return warn("projectPath is not set.");
      openSourceCode(targetIDE, {
        ...location,
        projectPath,
        element
      });
    }
  };
}

// src/inspector/serialize.ts
var Deep;
var List;
var Seen;
var InStore;
var HandleStore;
var IgnoreNextSeen;
var encodeNonObject = (value) => {
  switch (typeof value) {
    case "number":
      if (value === Infinity)
        return ["number" /* Number */, INFINITY];
      if (value === -Infinity)
        return ["number" /* Number */, NEGATIVE_INFINITY];
      if (isNaN(value))
        return ["number" /* Number */, NAN];
      return ["number" /* Number */, value];
    case "boolean":
      return ["boolean" /* Boolean */, value];
    case "string":
      return ["string" /* String */, value];
    case "symbol":
      return ["symbol" /* Symbol */, value.description || ""];
    case "function":
      return ["function" /* Function */, value.name];
    case "object":
      return ["null" /* Null */, null];
    default:
      return ["null" /* Null */, UNDEFINED];
  }
};
function encode(value) {
  const ignoreNextStore = IgnoreNextSeen;
  if (ignoreNextStore)
    IgnoreNextSeen = false;
  else {
    const seen = Seen.get(value);
    if (seen !== void 0)
      return seen;
  }
  if (!value || typeof value !== "object") {
    const index2 = List.push(encodeNonObject(value)) - 1;
    Seen.set(value, index2);
    return index2;
  }
  const encoded = [];
  const index = List.push(encoded) - 1;
  ignoreNextStore || Seen.set(value, index);
  if (value instanceof Element) {
    encoded[0] = "element" /* Element */;
    encoded[1] = `${getSdtId(
      value,
      "element" /* Element */
    )}:${value.localName}`;
  } else if (!ignoreNextStore && isStoreNode(value)) {
    const node = solid_api_default.unwrap(value);
    if (node !== value)
      Seen.set(node, index);
    const id = getSdtId(node, "store-node" /* StoreNode */);
    !InStore && HandleStore && HandleStore(node, id);
    const wasInStore = InStore;
    InStore = IgnoreNextSeen = true;
    encoded[0] = "store" /* Store */;
    encoded[1] = `${id}:${encode(node)}`;
    InStore = wasInStore;
  } else if (Array.isArray(value)) {
    encoded[0] = "array" /* Array */;
    encoded[1] = Deep ? value.map(encode) : value.length;
  } else {
    const name = Object.prototype.toString.call(value).slice(8, -1);
    if (name === "Object") {
      encoded[0] = "object" /* Object */;
      if (Deep) {
        const data = encoded[1] = {};
        for (const [key, descriptor] of Object.entries(
          Object.getOwnPropertyDescriptors(value)
        )) {
          data[key] = descriptor.get ? -1 : encode(descriptor.value);
        }
      } else {
        encoded[1] = Object.keys(value).length;
      }
    } else {
      encoded[0] = "instance" /* Instance */;
      encoded[1] = name;
    }
  }
  return index;
}
function encodeValue(value, deep, handleStore, inStore = false) {
  Deep = deep;
  List = [];
  Seen = /* @__PURE__ */ new Map();
  InStore = inStore;
  HandleStore = handleStore;
  encode(value);
  const result = List;
  Deep = List = Seen = HandleStore = InStore = void 0;
  return result;
}

// src/inspector/inspector.ts
var ValueNode = class {
  constructor(getValue) {
    this.getValue = getValue;
  }
  trackedStores = [];
  selected = false;
  addStoreObserver(unsub) {
    this.trackedStores.push(unsub);
  }
  unsubscribe() {
    for (const unsub of this.trackedStores)
      unsub();
    this.trackedStores = [];
  }
  reset() {
    this.unsubscribe();
    this.selected = false;
  }
  isSelected() {
    return this.selected;
  }
  setSelected(selected) {
    this.selected = selected;
    if (!selected)
      this.unsubscribe();
  }
};
var ValueNodeMap = class {
  record = {};
  get(id) {
    return this.record[id];
  }
  add(id, getValue) {
    this.record[id] = new ValueNode(getValue);
  }
  reset() {
    for (const signal of Object.values(this.record))
      signal.reset();
  }
};
var $NOT_SET = Symbol("not-set");
var ObservedProps = class {
  constructor(props) {
    this.props = props;
  }
  onPropStateChange;
  onValueUpdate;
  observedGetters = {};
  observe(onPropStateChange, onValueUpdate) {
    this.onPropStateChange = onPropStateChange;
    this.onValueUpdate = onValueUpdate;
  }
  unobserve() {
    this.onPropStateChange = void 0;
    this.onValueUpdate = void 0;
  }
  observeProp(key, id, get) {
    if (this.observedGetters[key]) {
      const o2 = this.observedGetters[key];
      return { getValue: () => o2.v, isStale: o2.n === 0 };
    }
    const self = this;
    const o = this.observedGetters[key] = {
      v: $NOT_SET,
      n: 0
    };
    Object.defineProperty(this.props, key, {
      get() {
        const value = get();
        if (solid_api_default.getListener()) {
          solid_api_default.onCleanup(
            () => --o.n === 0 && self.onPropStateChange?.(key, "stale" /* Stale */)
          );
        }
        ++o.n === 1 && self.onPropStateChange?.(key, "live" /* Live */);
        if (value !== o.v)
          self.onValueUpdate?.(id);
        return o.v = value;
      },
      enumerable: true
    });
    return { getValue: () => o.v, isStale: true };
  }
};
var compareProxyPropKeys = (oldKeys, newKeys) => {
  const added = new Set(newKeys);
  const removed = [];
  let changed = false;
  for (const key of oldKeys) {
    if (added.has(key))
      added.delete(key);
    else {
      changed = true;
      removed.push(key);
    }
  }
  if (!changed && !added.size)
    return null;
  return { added: Array.from(added), removed };
};
function clearOwnerObservers(owner, observedPropsMap) {
  if (isSolidComputation(owner)) {
    removeValueUpdateObserver(owner, $INSPECTOR);
    if (isSolidComponent(owner)) {
      observedPropsMap.get(owner.props)?.unobserve();
    }
  }
  if (owner.sourceMap) {
    for (const node of Object.values(owner.sourceMap))
      removeValueUpdateObserver(node, $INSPECTOR);
  }
  if (owner.owned) {
    for (const node of owner.owned)
      removeValueUpdateObserver(node, $INSPECTOR);
  }
}
var ValueMap;
var OnValueUpdate;
var OnPropStateChange;
var PropsMap;
var $INSPECTOR = Symbol("inspector");
var typeToObjectTypeMap = {
  ["signal" /* Signal */]: "signal" /* Signal */,
  ["memo" /* Memo */]: "owner" /* Owner */,
  ["store" /* Store */]: "store" /* Store */
};
function mapSourceValue(node, handler, isMemo) {
  const type = isMemo ? "memo" /* Memo */ : isSolidStore(node) ? "store" /* Store */ : isSolidSignal(node) ? "signal" /* Signal */ : null;
  if (!type)
    return null;
  const { value } = node, id = getSdtId(node, typeToObjectTypeMap[type]);
  ValueMap.add(`${"signal" /* Signal */}:${id}`, () => node.value);
  if (type !== "store" /* Store */)
    observeValueUpdate(node, (v) => handler(id, v), $INSPECTOR);
  return {
    type,
    name: getNodeName(node),
    id,
    value: encodeValue(value, false)
  };
}
function mapProps(props) {
  const isProxy = !!props[solid_api_default.$PROXY];
  const record = {};
  let checkProxyProps;
  if (isProxy) {
    let propsKeys = Object.keys(props);
    for (const key of propsKeys)
      record[key] = { getter: "stale" /* Stale */, value: null };
    checkProxyProps = () => {
      const _oldKeys = propsKeys;
      return compareProxyPropKeys(_oldKeys, propsKeys = Object.keys(props));
    };
  } else {
    let observed = PropsMap.get(props);
    if (!observed)
      PropsMap.set(props, observed = new ObservedProps(props));
    observed.observe(OnPropStateChange, OnValueUpdate);
    for (const [key, desc] of Object.entries(Object.getOwnPropertyDescriptors(props))) {
      const id = `prop:${key}`;
      if (desc.get) {
        const { getValue, isStale } = observed.observeProp(key, id, desc.get);
        ValueMap.add(id, getValue);
        const lastValue = getValue();
        record[key] = {
          getter: isStale ? "stale" /* Stale */ : "live" /* Live */,
          value: lastValue !== $NOT_SET ? encodeValue(getValue(), false) : null
        };
      } else {
        record[key] = {
          getter: false,
          value: encodeValue(desc.value, false)
        };
        if (Array.isArray(desc.value) || misc_exports.is_plain_object(desc.value))
          ValueMap.add(id, () => desc.value);
      }
    }
  }
  return { props: { proxy: isProxy, record }, checkProxyProps };
}
var collectOwnerDetails = /* @__PURE__ */ untrackedCallback(function(owner, config) {
  const { onValueUpdate } = config;
  ValueMap = new ValueNodeMap();
  OnValueUpdate = onValueUpdate;
  OnPropStateChange = config.onPropStateChange;
  PropsMap = config.observedPropsMap;
  const id = getSdtId(owner, "owner" /* Owner */);
  const type = markOwnerType(owner);
  let { sourceMap, owned } = owner;
  let getValue = () => owner.value;
  const details = { id, name: getNodeName(owner), type, signals: [] };
  if (type === "context" /* Context */) {
    sourceMap = void 0;
    owned = null;
    const symbols = Object.getOwnPropertySymbols(owner.context);
    const context_value = owner.context[symbols[symbols.length - 1]];
    getValue = () => context_value;
  }
  let checkProxyProps;
  if (isSolidComputation(owner)) {
    if (isSolidComponent(owner)) {
      const refresh = getComponentRefreshNode(owner);
      if (refresh) {
        sourceMap = refresh.sourceMap;
        owned = refresh.owned;
        getValue = () => refresh.value;
      }
      ({ checkProxyProps, props: details.props } = mapProps(owner.props));
      let location = owner.component.location;
      if (
        // get location from component.location
        typeof location === "string" && (location = parseLocationString(location)) || // get location from the babel plugin marks
        (location = solid_api_default.getOwnerLocation(owner)) && (location = parseLocationString(location))
      ) {
        details.location = location;
      }
    } else {
      observeValueUpdate(owner, () => onValueUpdate("value" /* Value */), $INSPECTOR);
    }
    details.value = encodeValue(getValue(), false);
  }
  const onSignalUpdate = (signalId) => onValueUpdate(`${"signal" /* Signal */}:${signalId}`);
  if (sourceMap) {
    for (const signal of sourceMap) {
      const mapped = mapSourceValue(signal, onSignalUpdate, false);
      mapped && details.signals.push(mapped);
    }
  }
  if (owned) {
    for (const node of owned) {
      if (!isSolidMemo(node))
        continue;
      const mapped = mapSourceValue(node, onSignalUpdate, true);
      mapped && details.signals.push(mapped);
    }
  }
  ValueMap.add("value" /* Value */, getValue);
  const result = {
    details,
    valueMap: ValueMap,
    checkProxyProps
  };
  ValueMap = OnValueUpdate = OnPropStateChange = PropsMap = void 0;
  return result;
});

// src/inspector/store.ts
var { isWrappable } = solid_api_default.STORE_DEV;
var Nodes = /* @__PURE__ */ new WeakMap();
var OnNodeUpdate3 = null;
function setOnStoreNodeUpdate(fn) {
  OnNodeUpdate3 = fn;
}
solid_api_default.STORE_DEV.hooks.onStoreNodeUpdate = (node, property, value, prev) => solid_api_default.untrack(() => {
  if (!OnNodeUpdate3 || !Nodes.has(node) || typeof property === "symbol")
    return;
  property = property.toString();
  const storeProperty = `${getSdtId(
    node,
    "store-node" /* StoreNode */
  )}:${property}`;
  if (property === "length" && typeof value === "number" && Array.isArray(node)) {
    return OnNodeUpdate3(storeProperty, value);
  }
  isWrappable(prev) && untrackStore(prev, storeProperty);
  if (value === void 0) {
    OnNodeUpdate3(storeProperty, void 0);
  } else {
    OnNodeUpdate3(storeProperty, { value });
    isWrappable(value) && trackStore(value, storeProperty);
  }
});
function observeStoreNode(rootNode) {
  rootNode = solid_api_default.unwrap(rootNode);
  const symbol = Symbol("inspect-store");
  return solid_api_default.untrack(() => {
    trackStore(rootNode, symbol);
    return () => untrackStore(rootNode, symbol);
  });
}
function trackStore(node, parent) {
  const data = Nodes.get(node);
  if (data)
    data.add(parent);
  else {
    Nodes.set(node, /* @__PURE__ */ new Set([parent]));
    const id = getSdtId(node, "store-node" /* StoreNode */);
    forEachStoreProp(node, (key, child) => trackStore(child, `${id}:${key}`));
  }
}
function untrackStore(node, parent) {
  const data = Nodes.get(node);
  if (data && data.delete(parent)) {
    data.size === 0 && Nodes.delete(node);
    const id = getSdtId(node, "store-node" /* StoreNode */);
    forEachStoreProp(node, (key, child) => untrackStore(child, `${id}:${key}`));
  }
}
function forEachStoreProp(node, fn) {
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      const child = node[i];
      isWrappable(child) && fn(i.toString(), child);
    }
  } else {
    for (const key in node) {
      const { value, get } = Object.getOwnPropertyDescriptor(node, key);
      if (!get && isWrappable(value))
        fn(key, value);
    }
  }
}

// src/inspector/index.ts
function createInspector(props) {
  let lastDetails;
  let inspectedOwner;
  let valueMap = new ValueNodeMap();
  const propsMap = /* @__PURE__ */ new WeakMap();
  let checkProxyProps;
  const { pushPropState, pushValueUpdate, pushInspectToggle, triggerPropsCheck, clearUpdates } = (() => {
    const valueUpdates = /* @__PURE__ */ new Map();
    let storeUpdates = [];
    let checkProps = false;
    let propStates = {};
    const flush = scheduleIdle(() => {
      const batchedUpdates = [];
      for (const [id, toggleChange] of valueUpdates) {
        const node = valueMap.get(id);
        if (!node || !node.getValue)
          continue;
        const selected = node.isSelected();
        const encoded = encodeValue(
          node.getValue(),
          selected,
          selected && ((storeNode) => node.addStoreObserver(observeStoreNode(storeNode)))
        );
        batchedUpdates.push([
          toggleChange === null ? "value" : "inspectToggle",
          [id, encoded]
        ]);
      }
      valueUpdates.clear();
      for (const [storeProperty, data] of storeUpdates)
        batchedUpdates.push([
          "store",
          [
            storeProperty,
            typeof data === "object" ? encodeValue(data.value, true, void 0, true) : data ?? null
          ]
        ]);
      storeUpdates = [];
      if (checkProps && checkProxyProps) {
        const keys3 = checkProxyProps();
        if (keys3)
          batchedUpdates.push(["propKeys", keys3]);
        checkProps = false;
      }
      if (Object.keys(propStates).length) {
        batchedUpdates.push(["propState", propStates]);
        propStates = {};
      }
      batchedUpdates.length && props.emit("InspectorUpdate", batchedUpdates);
    });
    const flushPropsCheck = throttle(flush, 200);
    setOnStoreNodeUpdate((...payload) => {
      storeUpdates.push(payload);
      flush();
    });
    return {
      pushValueUpdate(id) {
        valueUpdates.set(id, null);
        flush();
      },
      pushInspectToggle(id, selected) {
        const current = valueUpdates.get(id);
        if (current === selected || current === null)
          return;
        else if (current === !selected)
          valueUpdates.delete(id);
        else
          valueUpdates.set(id, selected);
        flush();
      },
      triggerPropsCheck() {
        checkProps = true;
        flushPropsCheck();
      },
      pushPropState(key, state) {
        propStates[key] = state;
        flush();
      },
      // since the updates are emitten on timeout, we need to make sure that
      // switching off the debugger or unselecting the owner will clear the updates
      clearUpdates() {
        valueUpdates.clear();
        storeUpdates = [];
        checkProps = false;
        flush.clear();
        flushPropsCheck.clear();
      }
    };
  })();
  let clearPrevDisposeListener;
  createEffect(() => {
    if (!props.enabled())
      return;
    const id = props.inspectedOwnerId();
    queueMicrotask(() => {
      const owner = id && getObjectById(id, "owner" /* Owner */);
      inspectedOwner && clearOwnerObservers(inspectedOwner, propsMap);
      inspectedOwner = owner;
      valueMap.reset();
      clearUpdates();
      if (owner) {
        const result = collectOwnerDetails(owner, {
          onValueUpdate: pushValueUpdate,
          onPropStateChange: pushPropState,
          observedPropsMap: propsMap
        });
        props.emit("InspectedNodeDetails", result.details);
        valueMap = result.valueMap;
        lastDetails = result.details;
        checkProxyProps = result.checkProxyProps || null;
      } else {
        lastDetails = void 0;
        checkProxyProps = null;
      }
      clearPrevDisposeListener?.();
      clearPrevDisposeListener = owner ? onOwnerDispose(owner, props.resetInspectedNode) : void 0;
    });
  });
  createEffect(() => {
    if (!props.enabled())
      return;
    onCleanup(addSolidUpdateListener(() => checkProxyProps && triggerPropsCheck()));
  });
  return {
    getLastDetails: () => lastDetails,
    toggleValueNode({ id, selected }) {
      const node = valueMap.get(id);
      if (!node)
        return warn("Could not find value node:", id);
      node.setSelected(selected);
      pushInspectToggle(id, selected);
    }
  };
}

// src/structure/walker.ts
var Mode;
var RootId;
var OnComputationUpdate;
var RegisterComponent;
var ElementsMap = /* @__PURE__ */ new Map();
var $WALKER = Symbol("tree-walker");
function observeComputation(owner, attachedData) {
  let isLeaf = !owner.owned || owner.owned.length === 0;
  const boundHandler = OnComputationUpdate.bind(
    void 0,
    RootId,
    attachedData,
    getSdtId(attachedData, "owner" /* Owner */)
  );
  const handler = isLeaf && Mode !== "dom" /* DOM */ ? () => {
    if (isLeaf && (!owner.owned || owner.owned.length === 0)) {
      boundHandler(false);
    } else {
      isLeaf = false;
      boundHandler(true);
    }
  } : boundHandler.bind(void 0, true);
  observeComputationUpdate(owner, handler, $WALKER);
}
function mapChildren(owner, mappedOwner) {
  const children2 = [];
  const rawChildren = owner.owned ? owner.owned.slice() : [];
  if (owner.sdtSubRoots)
    rawChildren.push.apply(rawChildren, owner.sdtSubRoots);
  if (Mode === "owners" /* Owners */) {
    for (const child of rawChildren) {
      const mappedChild = mapOwner(child, mappedOwner);
      if (mappedChild)
        children2.push(mappedChild);
    }
  } else {
    for (const child of rawChildren) {
      const type = markOwnerType(child);
      if (type === "component" /* Component */) {
        const mappedChild = mapOwner(child, mappedOwner);
        if (mappedChild)
          children2.push(mappedChild);
      } else {
        if (isObservableComputation(child))
          observeComputation(child, owner);
        children2.push.apply(children2, mapChildren(child, mappedOwner));
      }
    }
  }
  return children2;
}
var MappedOwnerNode;
var AddedToParentElements = false;
function mapElements(els, parentChildren) {
  const r = [];
  els:
    for (const el of els) {
      if (!(el instanceof HTMLElement))
        continue;
      if (parentChildren) {
        const toCheck = [parentChildren];
        let index = 0;
        let elNodes = toCheck[index++];
        while (elNodes) {
          for (let i = 0; i < elNodes.length; i++) {
            const elNode = elNodes[i];
            const elNodeData = ElementsMap.get(elNode);
            if (elNodeData && elNodeData.el === el) {
              if (AddedToParentElements) {
                elNodes.splice(i, 1);
              } else {
                elNodes[i] = MappedOwnerNode;
                AddedToParentElements = true;
              }
              r.push(elNode);
              elNodeData.component = MappedOwnerNode;
              continue els;
            }
            if (elNode.children.length)
              toCheck.push(elNode.children);
          }
          elNodes = toCheck[index++];
        }
      }
      const mappedEl = {
        id: getSdtId(el, "element" /* Element */),
        type: "element" /* Element */,
        name: el.localName,
        children: []
      };
      r.push(mappedEl);
      ElementsMap.set(mappedEl, { el, component: MappedOwnerNode });
      if (el.children.length)
        mappedEl.children = mapElements(el.children, parentChildren);
    }
  return r;
}
function mapOwner(owner, parent, overwriteType) {
  const id = getSdtId(owner, "owner" /* Owner */);
  const type = overwriteType ?? markOwnerType(owner);
  const name = getNodeName(owner);
  const mapped = { id, type, name };
  let resolvedElements;
  if (type === "component" /* Component */) {
    let contextNode;
    if (name === "provider" && owner.owned && owner.owned.length === 1 && markOwnerType(contextNode = owner.owned[0]) === "context" /* Context */) {
      return mapOwner(contextNode, parent, "context" /* Context */);
    }
    RegisterComponent({
      owner,
      id,
      name,
      elements: resolvedElements = resolveElements(owner.value)
    });
    const refresh = getComponentRefreshNode(owner);
    if (refresh) {
      mapped.hmr = true;
      owner = refresh;
    }
  } else if (isObservableComputation(owner)) {
    observeComputation(owner, owner);
    if (!owner.sources || owner.sources.length === 0)
      mapped.frozen = true;
  }
  const children2 = [];
  mapped.children = children2;
  AddedToParentElements = false;
  MappedOwnerNode = mapped;
  if (Mode === "dom" /* DOM */ && (resolvedElements = resolvedElements === void 0 ? resolveElements(owner.value) : resolvedElements)) {
    children2.push.apply(
      children2,
      mapElements(
        Array.isArray(resolvedElements) ? resolvedElements : [resolvedElements],
        parent?.children
      )
    );
  }
  const addedToParent = AddedToParentElements;
  children2.push.apply(children2, mapChildren(owner, mapped));
  return addedToParent ? void 0 : mapped;
}
var walkSolidTree = /* @__PURE__ */ untrackedCallback(function(owner, config) {
  Mode = config.mode;
  RootId = config.rootId;
  OnComputationUpdate = config.onComputationUpdate;
  RegisterComponent = config.registerComponent;
  const r = mapOwner(owner, null);
  if (Mode === "dom" /* DOM */) {
    for (const [elNode, { el, component }] of ElementsMap) {
      RegisterComponent({
        element: el,
        componentId: component.id,
        elementId: elNode.id
      });
    }
    ElementsMap.clear();
  }
  Mode = RootId = OnComputationUpdate = RegisterComponent = void 0;
  return r;
});

// src/structure/index.ts
function getClosestIncludedOwner(owner, mode) {
  let closest = null;
  let current = owner;
  do {
    if (isDisposed(current))
      closest = current.owner;
    current = current.owner;
  } while (current);
  owner = closest ?? owner;
  if (mode === "owners" /* Owners */)
    return owner;
  let root = null;
  do {
    const type = markOwnerType(owner);
    if (type === "component" /* Component */ || type === "context" /* Context */)
      return owner;
    if (type === "root" /* Root */)
      root = owner;
    owner = owner.owner;
  } while (owner);
  return root;
}
function createStructure(props) {
  let treeWalkerMode = DEFAULT_WALKER_MODE;
  const updateQueue = /* @__PURE__ */ new Set();
  const ownerRoots = /* @__PURE__ */ new Map();
  const removedRoots = /* @__PURE__ */ new Set();
  let shouldUpdateAllRoots = false;
  const onComputationUpdate = (rootId, owner, ownerId, changedStructure) => {
    queueMicrotask(() => {
      if (!props.enabled())
        return;
      changedStructure && updateOwner(owner, rootId);
      props.onNodeUpdate(ownerId);
    });
  };
  function forceFlushRootUpdateQueue() {
    if (props.enabled()) {
      const updated = {};
      const partial = !shouldUpdateAllRoots;
      shouldUpdateAllRoots = false;
      const [owners, getRootId] = partial ? [updateQueue, (owner) => ownerRoots.get(owner)] : [
        getCurrentRoots(),
        (owner) => getSdtId(owner, "owner" /* Owner */)
      ];
      for (const owner of owners) {
        const rootId = getRootId(owner);
        const tree = walkSolidTree(owner, {
          rootId,
          mode: treeWalkerMode,
          onComputationUpdate,
          registerComponent
        });
        const map = updated[rootId];
        if (map)
          map[tree.id] = tree;
        else
          updated[rootId] = { [tree.id]: tree };
      }
      props.onStructureUpdate({ partial, updated, removed: [...removedRoots] });
    }
    updateQueue.clear();
    flushRootUpdateQueue.clear();
    removedRoots.clear();
    ownerRoots.clear();
  }
  const flushRootUpdateQueue = throttle(forceFlushRootUpdateQueue, 250);
  function updateOwner(node, topRootId) {
    updateQueue.add(node);
    ownerRoots.set(node, topRootId);
    flushRootUpdateQueue();
  }
  setOnOwnerNeedsUpdate((node, topRootId) => {
    const closestIncludedOwner = getClosestIncludedOwner(node, treeWalkerMode);
    closestIncludedOwner && updateOwner(closestIncludedOwner, topRootId);
  });
  setOnRootRemoved((rootId) => {
    removedRoots.add(rootId);
    flushRootUpdateQueue();
  });
  props.listenToViewChange((view) => {
    if (view === "structure" /* Structure */) {
      updateAllRoots();
    }
  });
  function updateAllRoots() {
    shouldUpdateAllRoots = true;
    flushRootUpdateQueue();
  }
  function forceUpdateAllRoots() {
    shouldUpdateAllRoots = true;
    queueMicrotask(forceFlushRootUpdateQueue);
  }
  function setTreeWalkerMode(mode) {
    treeWalkerMode = mode;
    updateAllRoots();
    clearComponentRegistry();
  }
  return {
    updateAllRoots,
    forceUpdateAllRoots,
    setTreeWalkerMode,
    resetTreeWalkerMode: () => setTreeWalkerMode(DEFAULT_WALKER_MODE),
    getClosestIncludedOwner(owner) {
      return getClosestIncludedOwner(owner, treeWalkerMode);
    }
  };
}

// src/main/index.ts
var plugin = createInternalRoot(() => {
  const hub = {
    output: createGlobalEmitter(),
    input: createGlobalEmitter()
  };
  const [modules, toggleModules] = createStaticStore({
    debugger: false,
    locator: false,
    dgraph: false,
    locatorKeyPressSignal: () => false
  });
  const debuggerEnabled = createMemo(() => modules.debugger || modules.locatorKeyPressSignal());
  const dgraphEnabled = createMemo(() => modules.dgraph && debuggerEnabled());
  const locatorEnabled = createMemo(
    () => (modules.locatorKeyPressSignal() || modules.locator) && debuggerEnabled()
  );
  createEffect(
    defer(debuggerEnabled, (enabled) => {
      hub.output.emit("DebuggerEnabled", enabled);
    })
  );
  const viewChange = createEventBus();
  function setView(view) {
    batch(() => {
      viewChange.emit(view);
    });
  }
  function toggleModule(data) {
    switch (data.module) {
      case "structure" /* Structure */:
        break;
      case "dgraph" /* Dgraph */:
        toggleModules("dgraph", data.enabled);
        break;
      case "locator" /* Locator */:
        toggleModules("locator", data.enabled);
        break;
    }
  }
  const INITIAL_INSPECTED_STATE = {
    ownerId: null,
    signalId: null,
    treeWalkerOwnerId: null
  };
  const [inspectedState, setInspectedState] = createSignal(INITIAL_INSPECTED_STATE, { equals: false });
  const inspectedOwnerId = createMemo(() => inspectedState().ownerId);
  createEffect(() => hub.output.emit("InspectedState", inspectedState()));
  function getTreeWalkerOwnerId(ownerId) {
    const owner = ownerId && getObjectById(ownerId, "owner" /* Owner */);
    const treeWalkerOwner = owner && structure.getClosestIncludedOwner(owner);
    return treeWalkerOwner ? getSdtId(treeWalkerOwner, "owner" /* Owner */) : null;
  }
  function updateInspectedNode() {
    setInspectedState((p) => ({
      ...p,
      treeWalkerOwnerId: getTreeWalkerOwnerId(p.treeWalkerOwnerId)
    }));
  }
  function resetInspectedNode() {
    setInspectedState(INITIAL_INSPECTED_STATE);
  }
  function setInspectedNode(data) {
    let { ownerId, signalId } = data ?? { ownerId: null, signalId: null };
    if (ownerId && !getObjectById(ownerId, "owner" /* Owner */))
      ownerId = null;
    if (signalId && !getObjectById(signalId, "signal" /* Signal */))
      signalId = null;
    setInspectedState({
      ownerId,
      signalId,
      treeWalkerOwnerId: getTreeWalkerOwnerId(ownerId)
    });
  }
  createComputed(
    defer(debuggerEnabled, (enabled) => {
      if (!enabled)
        resetInspectedNode();
    })
  );
  const pushNodeUpdate = createBatchedUpdateEmitter((updates) => {
    hub.output.emit("NodeUpdates", updates);
  });
  const structure = createStructure({
    onStructureUpdate(updates) {
      hub.output.emit("StructureUpdates", updates);
      updateInspectedNode();
    },
    onNodeUpdate: pushNodeUpdate,
    enabled: debuggerEnabled,
    listenToViewChange: viewChange.listen
  });
  const inspector = createInspector({
    emit: hub.output.emit,
    enabled: debuggerEnabled,
    inspectedOwnerId,
    resetInspectedNode
  });
  createDependencyGraph({
    emit: hub.output.emit,
    enabled: dgraphEnabled,
    listenToViewChange: viewChange.listen,
    onNodeUpdate: pushNodeUpdate,
    inspectedState
  });
  const locator = createLocator({
    emit: hub.output.emit,
    locatorEnabled,
    setLocatorEnabledSignal: (signal) => toggleModules("locatorKeyPressSignal", () => signal),
    onComponentClick(componentId, next) {
      modules.debugger ? hub.output.emit("InspectedComponent", componentId) : next();
    }
  });
  function openInspectedNodeLocation() {
    const details = inspector.getLastDetails();
    details?.location && locator.openElementSourceCode(details.location, details.name);
  }
  createEffect(
    defer(modules.locatorKeyPressSignal, (state) => hub.output.emit("LocatorModeChange", state))
  );
  hub.input.listen((e) => {
    switch (e.name) {
      case "ResetState": {
        batch(() => {
          resetInspectedNode();
          structure.resetTreeWalkerMode();
          locator.setDevtoolsHighlightTarget(null);
        });
        break;
      }
      case "HighlightElementChange":
        return locator.setDevtoolsHighlightTarget(e.details);
      case "InspectNode":
        return setInspectedNode(e.details);
      case "InspectValue":
        return inspector.toggleValueNode(e.details);
      case "OpenLocation":
        return openInspectedNodeLocation();
      case "TreeViewModeChange":
        return structure.setTreeWalkerMode(e.details);
      case "ViewChange":
        return setView(e.details);
      case "ToggleModule":
        return toggleModule(e.details);
    }
  });
  function useDebugger2() {
    return {
      meta: {
        versions: solid_api_default.versions
      },
      enabled: debuggerEnabled,
      toggleEnabled: (enabled) => void toggleModules("debugger", enabled),
      on: hub.output.on,
      listen: hub.output.listen,
      emit: hub.input.emit
    };
  }
  return {
    useDebugger: useDebugger2,
    useLocator: locator.useLocator
  };
});
var { useDebugger, useLocator } = plugin;

export { addSolidUpdateListener, attachDebugger, createInternalRoot, getNodeName, getNodeType, getOwnerType, interceptComputationRerun, isSolidComputation, isSolidMemo, isSolidOwner, isSolidRoot, isSolidSignal, isSolidStore, lookupOwner, makeValueUpdateListener, observeValueUpdate, onOwnerCleanup, onParentCleanup, removeValueUpdateObserver, unobserveAllRoots, useDebugger, useLocator };
