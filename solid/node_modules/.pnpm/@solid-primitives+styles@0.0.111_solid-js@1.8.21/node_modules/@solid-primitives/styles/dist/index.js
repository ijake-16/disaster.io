import { onCleanup } from 'solid-js';
import { isServer } from 'solid-js/web';
import { createHydratableSingletonRoot } from '@solid-primitives/rootless';
import { createHydratableSignal } from '@solid-primitives/utils';

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
var getRemSize = () => isServer ? serverRemSize : parseFloat(getComputedStyle(document.documentElement).fontSize);
function createRemSize() {
  if (isServer) {
    return () => serverRemSize;
  }
  const [remSize, setRemSize] = createHydratableSignal(serverRemSize, getRemSize);
  const el = document.createElement("div");
  Object.assign(el.style, totallyHiddenStyles, { width: "1rem" });
  document.body.appendChild(el);
  let init = true;
  const ro = new ResizeObserver(() => {
    if (init)
      return init = false;
    setRemSize(getRemSize());
  });
  ro.observe(el);
  onCleanup(() => {
    el.remove();
    ro.disconnect();
  });
  return remSize;
}
var useRemSize = /* @__PURE__ */ createHydratableSingletonRoot(createRemSize);
var setServerRemSize = isServer ? (size) => {
  serverRemSize = size;
} : () => {
};

export { createRemSize, getRemSize, setServerRemSize, useRemSize };
