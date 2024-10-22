'use strict';

var solidJs = require('solid-js');
var web = require('solid-js/web');
var rootless = require('@solid-primitives/rootless');
var utils = require('@solid-primitives/utils');

// src/index.ts
var serverRemSize = 16;
var totallyHiddenStyles = {
  border: "0",
  padding: "0",
  visibility: "hidden",
  position: "absolute",
  top: "-9999px",
  left: "-9999px"
};
exports.getRemSize = () => web.isServer ? serverRemSize : parseFloat(getComputedStyle(document.documentElement).fontSize);
function createRemSize() {
  if (web.isServer) {
    return () => serverRemSize;
  }
  const [remSize, setRemSize] = utils.createHydratableSignal(serverRemSize, exports.getRemSize);
  const el = document.createElement("div");
  Object.assign(el.style, totallyHiddenStyles, { width: "1rem" });
  document.body.appendChild(el);
  let init = true;
  const ro = new ResizeObserver(() => {
    if (init)
      return init = false;
    setRemSize(exports.getRemSize());
  });
  ro.observe(el);
  solidJs.onCleanup(() => {
    el.remove();
    ro.disconnect();
  });
  return remSize;
}
exports.useRemSize = /* @__PURE__ */ rootless.createHydratableSingletonRoot(createRemSize);
exports.setServerRemSize = web.isServer ? (size) => {
  serverRemSize = size;
} : () => {
};

exports.createRemSize = createRemSize;
