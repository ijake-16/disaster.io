import { Accessor } from 'solid-js';

/**
 * Reads the current rem size from the document root.
 */
declare const getRemSize: () => number;
/**
 * Creates a reactive signal with value of the current rem size, and tracks it's changes.
 * @returns A signal with the current rem size in pixels.
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/styles#createRemSize.
 * @example
 * const remSize = createRemSize();
 * console.log(remSize()); // 16
 */
declare function createRemSize(): Accessor<number>;
/**
 * Returns a reactive signal with value of the current rem size, and tracks it's changes.
 *
 * This is a [singleton root primitive](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSingletonRoot) except if during hydration.
 *
 * @returns A signal with the current rem size in pixels.
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/styles#useRemSize.
 * @example
 * const remSize = useRemSize();
 * console.log(remSize()); // 16
 */
declare const useRemSize: () => Accessor<number>;
/**
 * Set the server fallback value for the rem size. {@link getRemSize}, {@link createRemSize} and {@link useRemSize} will return this value on the server.
 */
declare const setServerRemSize: (size: number) => void;

export { createRemSize, getRemSize, setServerRemSize, useRemSize };
