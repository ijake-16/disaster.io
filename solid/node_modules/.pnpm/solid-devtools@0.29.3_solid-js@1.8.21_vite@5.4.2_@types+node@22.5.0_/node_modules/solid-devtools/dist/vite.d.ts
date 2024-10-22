import { PluginOption } from 'vite';
import { LocatorOptions, TargetURLFunction } from '@solid-devtools/debugger/types';

type DevtoolsPluginOptions = {
    /** Add automatic name when creating signals, memos, stores, or mutables */
    autoname?: boolean;
    locator?: boolean | {
        /** Choose in which IDE the component source code should be revealed. */
        targetIDE?: Exclude<LocatorOptions['targetIDE'], TargetURLFunction>;
        /**
         * Holding which key should enable the locator overlay?
         * @default 'Alt'
         */
        key?: LocatorOptions['key'];
        /** Inject location attributes to jsx templates */
        jsxLocation?: boolean;
        /** Inject location information to component declarations */
        componentLocation?: boolean;
    };
};
declare const devtoolsPlugin: (_options?: DevtoolsPluginOptions) => PluginOption;

export { DevtoolsPluginOptions, devtoolsPlugin as default };
