import { tryOnCleanup } from '@solid-primitives/utils';
import { onCleanup, createSignal, createEffect, on, batch } from 'solid-js';
import { push, drop, filterOut } from '@solid-primitives/utils/immutable';

// src/eventBus.ts
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

// src/eventHub.ts
function createEventHub(defineChannels) {
  const global = /* @__PURE__ */ createEventBus();
  const buses = typeof defineChannels === "function" ? defineChannels(createEventBus) : defineChannels;
  const value = {};
  Object.entries(buses).forEach(([name, bus]) => {
    bus.value && Object.defineProperty(value, name, { get: bus.value, enumerable: true });
    bus.listen((payload) => global.emit({ name, details: payload }));
  });
  return {
    ...buses,
    value,
    on: (e, a) => buses[e].listen(a),
    emit: (e, a) => buses[e].emit(a),
    listen: global.listen
  };
}
function createEventStack(config = {}) {
  const { toValue = (e) => e, length = 0 } = config;
  const [stack, setValue] = /* @__PURE__ */ createSignal([]);
  const eventEventBus = createEventBus();
  const valueEventBus = createEventBus();
  eventEventBus.listen((event) => {
    const value = toValue(event, stack());
    setValue((prev) => {
      const list = push(prev, value);
      return length && list.length > length ? drop(list) : list;
    });
    valueEventBus.emit({
      event: value,
      stack: stack(),
      remove: () => remove(value)
    });
  });
  const remove = (value) => !!setValue((p) => filterOut(p, value)).removed;
  return {
    clear: valueEventBus.clear,
    listen: valueEventBus.listen,
    emit: eventEventBus.emit,
    value: stack,
    setValue,
    remove
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
function toPromise(subscribe) {
  return new Promise((resolve) => once(subscribe, resolve));
}
function once(subscribe, listener) {
  const unsub = subscribe((payload) => {
    unsub();
    listener(payload);
  });
  return unsub;
}
function toEffect(emit) {
  const [stack, setStack] = createSignal([]);
  createEffect(
    on(stack, (stack2) => {
      if (!stack2.length)
        return;
      setStack([]);
      stack2.forEach(emit);
    })
  );
  return (payload) => void setStack((p) => push(p, payload));
}
function batchEmits(bus) {
  return {
    ...bus,
    emit: (...args) => batch(() => bus.emit(...args))
  };
}

export { EmitterCore, EventBusCore, batchEmits, createEmitter, createEventBus, createEventHub, createEventStack, createGlobalEmitter, once, toEffect, toPromise };
