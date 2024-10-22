import { error } from '@solid-devtools/shared/utils';
import * as SolidAPI from 'solid-js';
import { DEV, getOwner, createRoot, getListener, onCleanup, $PROXY, untrack } from 'solid-js';
import * as StoreAPI from 'solid-js/store';
import { DEV as DEV$1, unwrap } from 'solid-js/store';
import * as WebAPI from 'solid-js/web';

// src/setup.ts
var OwnerLocationMap = /* @__PURE__ */ new WeakMap();
function setOwnerLocation(location) {
  const owner = getOwner();
  owner && OwnerLocationMap.set(owner, location);
}
function getOwnerLocation(owner) {
  return OwnerLocationMap.get(owner) ?? null;
}
var PassedLocatorOptions = null;
function useLocator(options) {
  PassedLocatorOptions = options;
}
var ClientVersion = null;
var SolidVersion = null;
var ExpectedSolidVersion = null;
function setClientVersion(version) {
  ClientVersion = version;
}
function setSolidVersion(version, expected) {
  SolidVersion = version;
  ExpectedSolidVersion = expected;
}
var DevEvents = [];
if (window.SolidDevtools$$) {
  error("Debugger is already setup");
}
if (!DEV || !DEV$1) {
  error("SolidJS in not in development mode!");
} else {
  window.SolidDevtools$$ = {
    Solid: SolidAPI,
    Store: StoreAPI,
    Web: WebAPI,
    DEV,
    getOwner,
    createRoot,
    getListener,
    onCleanup,
    $PROXY,
    untrack,
    STORE_DEV: DEV$1,
    unwrap,
    getDevEvents() {
      const events = DevEvents ?? [];
      DevEvents = null;
      return events;
    },
    get locatorOptions() {
      return PassedLocatorOptions;
    },
    versions: {
      get client() {
        return ClientVersion;
      },
      get solid() {
        return SolidVersion;
      },
      get expectedSolid() {
        return ExpectedSolidVersion;
      }
    },
    getOwnerLocation
  };
  DEV.hooks.afterCreateOwner = function(owner) {
    if (!DevEvents)
      return;
    DevEvents.push({
      timestamp: Date.now(),
      type: "RootCreated" /* RootCreated */,
      data: owner
    });
  };
}

export { getOwnerLocation, setClientVersion, setOwnerLocation, setSolidVersion, useLocator };
