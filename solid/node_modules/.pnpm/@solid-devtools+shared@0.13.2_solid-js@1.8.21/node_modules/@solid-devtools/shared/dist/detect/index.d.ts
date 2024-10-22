declare const DATA_HYDRATION_KEY = "data-hk";
declare const SOLID_DEV_GLOBAL = "Solid$$";
/**
 * Detects if SolidJS is present on the page. In either development or production mode.
 */
declare function detectSolid(): Promise<boolean>;
declare function detectSolidDev(): boolean;
declare function onSolidDevDetect(callback: () => void): void;
declare const SOLID_DEVTOOLS_GLOBAL = "SolidDevtools$$";
declare function detectSolidDevtools(): boolean;
declare function onSolidDevtoolsDetect(callback: () => void): void;

export { DATA_HYDRATION_KEY, SOLID_DEVTOOLS_GLOBAL, SOLID_DEV_GLOBAL, detectSolid, detectSolidDev, detectSolidDevtools, onSolidDevDetect, onSolidDevtoolsDetect };
