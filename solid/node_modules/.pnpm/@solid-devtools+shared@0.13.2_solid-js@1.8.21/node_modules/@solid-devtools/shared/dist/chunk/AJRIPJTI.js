// src/utils.ts
var getLogLabel = () => [
  `%csolid-devtools`,
  "color: #fff; background: #2c4f7c; padding: 1px 4px;"
];
function info(data) {
  console.info(...getLogLabel(), data);
  return data;
}
function log(...args) {
  console.log(...getLogLabel(), ...args);
  return;
}
function warn(...args) {
  console.warn(...getLogLabel(), ...args);
  return;
}
function error(...args) {
  console.error(...getLogLabel(), ...args);
  return;
}
function formatTime(d = /* @__PURE__ */ new Date()) {
  return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2);
}
function interceptPropertySet(obj, key, cb) {
  const descriptor = Object.getOwnPropertyDescriptor(obj, key);
  if (!descriptor) {
    let value = obj[key];
    Object.defineProperty(obj, key, {
      set(newValue) {
        value = newValue;
        cb(newValue);
      },
      get() {
        return value;
      }
    });
    return;
  }
  const { set } = descriptor;
  if (!set)
    return;
  Object.defineProperty(obj, key, {
    set(value) {
      cb(value);
      set.call(this, value);
    },
    get() {
      return descriptor.get?.call(this);
    }
  });
}
var asArray = (value) => Array.isArray(value) ? value : [value];
function callArrayProp(object, key, ...args) {
  const arr = object[key];
  if (arr)
    for (const cb of arr)
      cb(...args);
}
function pushToArrayProp(object, key, value) {
  let arr = object[key];
  if (arr)
    arr.push(value);
  else
    arr = object[key] = [value];
  return arr;
}
function trimString(str, maxLength) {
  if (str.length <= maxLength)
    return str;
  return str.slice(0, maxLength) + "\u2026";
}
function findIndexById(array, id) {
  for (let i = 0; i < array.length; i++)
    if (array[i].id === id)
      return i;
  return -1;
}
function findItemById(array, id) {
  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    if (item.id === id)
      return item;
  }
}
var splitOnColon = (str) => {
  const splitIndex = str.indexOf(":");
  if (splitIndex === -1)
    return [str, null];
  return [str.slice(0, splitIndex), str.slice(splitIndex + 1)];
};
function whileArray(toCheck, callback) {
  let index = 0;
  let current = toCheck[index++];
  while (current) {
    const result = callback(current, toCheck);
    if (result !== void 0)
      return result;
    current = toCheck[index++];
  }
}
function dedupeArrayById(input) {
  const ids = /* @__PURE__ */ new Set();
  const deduped = [];
  for (let i = input.length - 1; i >= 0; i--) {
    const update = input[i];
    if (ids.has(update.id))
      continue;
    ids.add(update.id);
    deduped.push(update);
  }
  return deduped;
}

export { asArray, callArrayProp, dedupeArrayById, error, findIndexById, findItemById, formatTime, info, interceptPropertySet, log, pushToArrayProp, splitOnColon, trimString, warn, whileArray };
