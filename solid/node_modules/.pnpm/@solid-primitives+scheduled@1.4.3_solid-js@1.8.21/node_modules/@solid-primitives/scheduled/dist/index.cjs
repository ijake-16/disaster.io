'use strict';

var solidJs = require('solid-js');
var web = require('solid-js/web');

// src/index.ts
exports.debounce = (callback, wait) => {
  if (web.isServer) {
    return Object.assign(() => void 0, { clear: () => void 0 });
  }
  let timeoutId;
  const clear = () => clearTimeout(timeoutId);
  if (solidJs.getOwner())
    solidJs.onCleanup(clear);
  const debounced = (...args) => {
    if (timeoutId !== void 0)
      clear();
    timeoutId = setTimeout(() => callback(...args), wait);
  };
  return Object.assign(debounced, { clear });
};
exports.throttle = (callback, wait) => {
  if (web.isServer) {
    return Object.assign(() => void 0, { clear: () => void 0 });
  }
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
  if (solidJs.getOwner())
    solidJs.onCleanup(clear);
  return Object.assign(throttled, { clear });
};
exports.scheduleIdle = web.isServer ? () => Object.assign(() => void 0, { clear: () => void 0 }) : (
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
    if (solidJs.getOwner())
      solidJs.onCleanup(clear);
    return Object.assign(deferred, { clear });
  } : (
    // fallback to setTimeout (throttle)
    (callback) => exports.throttle(callback)
  )
);
function leading(schedule, callback, wait) {
  if (web.isServer) {
    let called = false;
    const scheduled2 = (...args) => {
      if (called)
        return;
      called = true;
      callback(...args);
    };
    return Object.assign(scheduled2, { clear: () => void 0 });
  }
  let isScheduled = false;
  const scheduled = schedule(() => isScheduled = false, wait);
  const func = (...args) => {
    if (!isScheduled)
      callback(...args);
    isScheduled = true;
    scheduled();
  };
  const clear = () => {
    isScheduled = false;
    scheduled.clear();
  };
  if (solidJs.getOwner())
    solidJs.onCleanup(clear);
  return Object.assign(func, { clear });
}
function leadingAndTrailing(schedule, callback, wait) {
  if (web.isServer) {
    let called = false;
    const scheduled2 = (...args) => {
      if (called)
        return;
      called = true;
      callback(...args);
    };
    return Object.assign(scheduled2, { clear: () => void 0 });
  }
  let State;
  ((State2) => {
    State2[State2["Ready"] = 0] = "Ready";
    State2[State2["Leading"] = 1] = "Leading";
    State2[State2["Trailing"] = 2] = "Trailing";
  })(State || (State = {}));
  let state = 0 /* Ready */;
  const scheduled = schedule((args) => {
    state === 2 /* Trailing */ && callback(...args);
    state = 0 /* Ready */;
  }, wait);
  const fn = (...args) => {
    if (state !== 2 /* Trailing */) {
      if (state === 0 /* Ready */)
        callback(...args);
      state += 1;
    }
    scheduled(args);
  };
  const clear = () => {
    state = 0 /* Ready */;
    scheduled.clear();
  };
  if (solidJs.getOwner())
    solidJs.onCleanup(clear);
  return Object.assign(fn, { clear });
}
function createScheduled(schedule) {
  let listeners = 0;
  let isDirty = false;
  const [track, dirty] = solidJs.createSignal(void 0, { equals: false });
  const call = schedule(() => {
    isDirty = true;
    dirty();
  });
  return () => {
    if (!isDirty)
      call(), track();
    if (isDirty) {
      isDirty = !!listeners;
      return true;
    }
    if (solidJs.getListener()) {
      listeners++;
      solidJs.onCleanup(() => listeners--);
    }
    return false;
  };
}

exports.createScheduled = createScheduled;
exports.leading = leading;
exports.leadingAndTrailing = leadingAndTrailing;
