"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const GENERATE_ATTEMPTS = crypto.randomBytes === crypto.pseudoRandomBytes ? 1 : 3;
/**
 * Generates strong pseudo-random bytes.
 */
function generateRandomBytes(size, attempts, callback) {
    crypto.randomBytes(size, (err, buf) => {
        if (!err) {
            return callback(null, buf);
        }
        if (!--attempts) {
            return callback(err, null);
        }
        setTimeout(() => { generateRandomBytes(size, attempts, callback); }, 10);
    });
}
/**
 * Generates strong pseudo-random bytes.
 *
 */
function randomBytes(size) {
    return new Promise((resolve, reject) => {
        generateRandomBytes(size, GENERATE_ATTEMPTS, (err, buf) => err ? reject(err) : resolve(buf));
    });
}
exports.randomBytes = randomBytes;
/**
 * Generates strong pseudo-random bytes sync.
 *
 */
function randomBytesSync(size) {
    let err = null;
    for (let i = 0; i < GENERATE_ATTEMPTS; i++) {
        try {
            return crypto.randomBytes(size);
        }
        catch (e) {
            err = e;
        }
    }
    throw err;
}
exports.randomBytesSync = randomBytesSync;
exports.default = {
    randomBytes,
    randomBytesSync,
};
//# sourceMappingURL=randomBytes.js.map