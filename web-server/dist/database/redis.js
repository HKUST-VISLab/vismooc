"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis = require("ioredis");
class Redis extends ioredis {
    constructor(options = {}, flushDB = false) {
        super(Object.assign({}, Redis.defaultOptions, options));
        if (flushDB) {
            this.flushdb();
        }
    }
    dropDatabase() {
        this.flushdb();
    }
}
Redis.defaultOptions = {
    dropBufferSupport: true,
    port: 6379,
    host: 'localhost',
    db: 0,
};
exports.Redis = Redis;
//# sourceMappingURL=redis.js.map