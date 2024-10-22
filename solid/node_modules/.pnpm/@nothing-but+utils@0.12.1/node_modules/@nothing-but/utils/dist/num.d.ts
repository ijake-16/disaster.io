export declare function random(max: number): number;
export declare function random_from(min: number, max: number): number;
export declare function random_int(max: number): number;
export declare function random_int_from(min: number, max: number): number;
export declare function clamp(value: number, min: number, max: number): number;
export declare function remainder(a: number, b: number): number;
export declare function wrap(value: number, min: number, max: number): number;
export declare function bounce(value: number, min: number, max: number): number;
/**
 * Linear interpolation
 * @param start Start value
 * @param end End value
 * @param t Interpolation factor
 *
 * ```ts
 * start + (end - start) * t
 * ```
 */
export declare function lerp(start: number, end: number, t: number): number;
export declare function map_range(value: number, in_min: number, in_max: number, out_min: number, out_max: number): number;
export declare function to_percent(value: number, min: number, max: number): number;
export declare function equals(a: number, b: number): boolean;
export declare function between(a: number, b: number, c: number): boolean;
export declare function ranges_intersecting(a1: number, b1: number, a2: number, b2: number): boolean;
//# sourceMappingURL=num.d.ts.map