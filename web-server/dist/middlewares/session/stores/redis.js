"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("../../../database/redis");
const base_1 = require("./base");
class RedisStore extends base_1.BaseStore {
    constructor(prefix = '', redis = new redis_1.Redis()) {
        super(prefix);
        this.redis = redis;
    }
    get(sid) {
        return __awaiter(this, void 0, void 0, function* () {
            sid = this.prefix + sid;
            const session = JSON.parse(yield this.redis.get(sid));
            return session;
        });
    }
    set(sid, val, ttl) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            sid = this.prefix + sid;
            ttl = yield _super("set").call(this, sid, val, ttl);
            yield this.redis.set(sid, JSON.stringify(val));
            yield this.redis.pexpire(sid, ttl);
        });
    }
    destroy(sid) {
        return __awaiter(this, void 0, void 0, function* () {
            sid = this.prefix + sid;
            yield this.redis.del(sid);
        });
    }
}
exports.RedisStore = RedisStore;
//# sourceMappingURL=redis.js.map