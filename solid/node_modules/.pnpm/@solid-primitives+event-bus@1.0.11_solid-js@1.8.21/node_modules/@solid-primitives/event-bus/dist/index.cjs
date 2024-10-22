'use strict';

var utils = require('@solid-primitives/utils');
var solidJs = require('solid-js');
var immutable = require('@solid-primitives/utils/immutable');

// src/eventBus.ts
exports.EventBusCore = class EventBusCore extends Set {
  emit(payload) {
    for (const cb of this)
      cb(payload);
  }
};
function createEventBus() {
  const bus = new exports.EventBusCore();
  return {
    listen(listener) {
      bus.add(listener);
      return utils.tryOnCleanup(bus.delete.bind(bus, listener));
    },
    emit: bus.emit.bind(bus),
    clear: solidJs.onCleanup(bus.clear.bind(bus))
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
  const [stack, setValue] = /* @__PURE__ */ solidJs.createSignal([]);
  const eventEventBus = createEventBus();
  const valueEventBus = createEventBus();
  eventEventBus.listen((event) => {
    const value = toValue(event, stack());
    setValue((prev) => {
      const list = immutable.push(prev, value);
      return length && list.length > length ? immutable.drop(list) : list;
    });
    valueEventBus.emit({
      event: value,
      stack: stack(),
      remove: () => remove(value)
    });
  });
  const remove = (value) => !!setValue((p) => immutable.filterOut(p, value)).removed;
  return {
    clear: valueEventBus.clear,
    listen: valueEventBus.listen,
    emit: eventEventBus.emit,
    value: stack,
    setValue,
    remove
  };
}
exports.EmitterCore = class EmitterCore extends Map {
  on(event, listener) {
    let bus = this.get(event);
    bus || this.set(event, bus = new exports.EventBusCore());
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
  const emitter = new exports.EmitterCore();
  return {
    on(event, listener) {
      emitter.on(event, listener);
      return utils.tryOnCleanup(emitter.off.bind(emitter, event, listener));
    },
    emit: emitter.emit.bind(emitter),
    clear: solidJs.onCleanup(emitter.clear.bind(emitter))
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
  const [stack, setStack] = solidJs.createSignal([]);
  solidJs.createEffect(
    solidJs.on(stack, (stack2) => {
      if (!stack2.length)
        return;
      setStack([]);
      stack2.forEach(emit);
    })
  );
  return (payload) => void setStack((p) => immutable.push(p, payload));
}
function batchEmits(bus) {
  return {
    ...bus,
    emit: (...args) => solidJs.batch(() => bus.emit(...args))
  };
}

exports.batchEmits = batchEmits;
exports.createEmitter = createEmitter;
exports.createEventBus = createEventBus;
exports.createEventHub = createEventHub;
exports.createEventStack = createEventStack;
exports.createGlobalEmitter = createGlobalEmitter;
exports.once = once;
exports.toEffect = toEffect;
exports.toPromise = toPromise;
