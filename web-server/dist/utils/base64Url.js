"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function unescape(str) {
    return (`${str}${'==='.slice((str.length + 3) % 4)}`)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
}
exports.unescape = unescape;
function escape(str) {
    return str.replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}
exports.escape = escape;
function encode(str) {
    return escape(new Buffer(str).toString('base64'));
}
exports.encode = encode;
function decode(str) {
    return new Buffer(this.unescape(str), 'base64').toString();
}
exports.decode = decode;
exports.default = {
    escape,
    unescape,
    encode,
    decode,
};
//# sourceMappingURL=base64Url.js.map