export function random(max) {
    return Math.random() * max;
}
export function random_from(min, max) {
    return Math.random() * (max - min) + min;
}
export function random_int(max) {
    return Math.floor(Math.random() * max);
}
export function random_int_from(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
export function remainder(a, b) {
    return ((a % b) + b) % b;
}
export function wrap(value, min, max) {
    return remainder(value - min, max - min) + min;
}
export function bounce(value, min, max) {
    const range = max - min, rem = wrap(value - min, 0, 2 * range), distance = Math.abs(rem - range);
    return max - distance;
}
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
export function lerp(start, end, t) {
    return start + (end - start) * t;
}
export function map_range(value, in_min, in_max, out_min, out_max) {
    return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}
export function to_percent(value, min, max) {
    return (value - min) / (max - min);
}
export function equals(a, b) {
    return Math.abs(a - b) < Number.EPSILON;
}
export function between(a, b, c) {
    if (a > c)
        [a, c] = [c, a];
    return a - Number.EPSILON <= b && b <= c + Number.EPSILON;
}
export function ranges_intersecting(a1, b1, a2, b2) {
    if (a1 > b1)
        [a1, b1] = [b1, a1];
    if (a2 > b2)
        [a2, b2] = [b2, a2];
    return a1 <= b2 && a2 <= b1;
}
