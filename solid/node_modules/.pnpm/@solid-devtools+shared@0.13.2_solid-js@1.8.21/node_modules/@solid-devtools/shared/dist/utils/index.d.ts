declare function info<T>(data: T): T;
declare function log(...args: any[]): undefined;
declare function warn(...args: any[]): undefined;
declare function error(...args: any[]): undefined;
declare function formatTime(d?: Date): string;
declare function interceptPropertySet<TObject extends object, TKey extends keyof TObject>(obj: TObject, key: TKey, cb: (value: TObject[TKey]) => void): void;
declare const asArray: <T>(value: T) => (T extends any[] ? T[number] : T)[];
declare function callArrayProp<K extends PropertyKey, T extends (...args: Args) => void, Args extends unknown[]>(object: {
    [_ in K]?: T[];
}, key: K, ...args: Args): void;
declare function pushToArrayProp<K extends PropertyKey, T>(object: {
    [_ in K]?: T[];
}, key: K, value: T): T[];
/** function that trims too long string */
declare function trimString(str: string, maxLength: number): string;
declare function findIndexById<T extends {
    id: string;
}>(array: T[], id: string): number;
declare function findItemById<T extends {
    id: string;
}>(array: T[], id: string): T | undefined;
declare const splitOnColon: <T extends string>(str: T) => T extends `${infer L}:${infer R}` ? [L, R] : [T, null];
declare function whileArray<T, U>(toCheck: T[], callback: (item: T, toCheck: T[]) => U | undefined): U | undefined;
type ToDyscriminatedUnion<T extends {}, TK extends PropertyKey = 'type', DK extends void | PropertyKey = void> = {
    [K in keyof T]: {
        [k in TK]: K;
    } & (DK extends PropertyKey ? {
        [k in DK]: T[K];
    } : T[K]);
}[keyof T];
declare function dedupeArrayById<T extends {
    id: unknown;
}>(input: T[]): T[];

export { ToDyscriminatedUnion, asArray, callArrayProp, dedupeArrayById, error, findIndexById, findItemById, formatTime, info, interceptPropertySet, log, pushToArrayProp, splitOnColon, trimString, warn, whileArray };
