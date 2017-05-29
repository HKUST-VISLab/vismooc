"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * promisify()
 *
 * Transforms callback-based function -- func(arg1, arg2 .. argN, callback) -- into
 * an ES6-compatible Promise. Promisify provides a default callback of the form (error, result)
 * and rejects when `error` is truthy. You can also supply settings object as the second argument.
 *
 * @param {function} originalFunc - The function to promisify
 * @param {object} options - Settings object
 * @param {object} options.thisArg - A `this` context to use. If not set, assume `settings` _is_ `thisArg`
 * @param {bool} options.multiArgs - Should multiple arguments be returned as an array?
 * @return {function} A promisified version of `originalFunc`
 */
function promisify(originalFunc, options) {
    return (...args) => {
        let thisArg;
        if (options && options.thisArg) {
            thisArg = options.thisArg;
        }
        else if (options) {
            thisArg = options;
        }
        return new Promise((resolve, reject) => {
            const callback = (err, result) => err ? reject(err) : resolve(result);
            args.push(callback);
            const response = originalFunc.apply(thisArg, args);
            if (thatLooksLikeAPromiseToMe(response)) {
                resolve(response);
            }
        });
    };
}
exports.default = promisify;
/**
 * thatLooksLikeAPromiseToMe()
 *
 * Duck-types a promise.
 *
 * @param {object} o
 * @return {bool} True if this resembles a promise
 */
function thatLooksLikeAPromiseToMe(o) {
    return o && typeof o.then === 'function' && typeof o.catch === 'function';
}
//# sourceMappingURL=promisify.js.map