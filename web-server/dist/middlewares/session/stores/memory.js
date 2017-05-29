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
const base_1 = require("./base");
/**
 * Warning message for `MemoryStore` usage in production.
 */
const warning = `Warning: koa-generic-session\'s MemoryStore is not
    designed for a production environment, as it will leak
    memory, and will not scale past a single process.`;
class MemoryStore extends base_1.BaseStore {
    constructor(prefix = null) {
        super(prefix);
        // notify user that this store is not
        // meant for a production environment
        if ('production' === process.env.NODE_ENV) {
            console.warn(warning);
        }
        this.sessions = {};
        this.timeouts = {};
    }
    set(sid, val, ttl) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            sid = this.prefix + sid;
            ttl = yield _super("set").call(this, sid, val, ttl);
            this.sessions[sid] = val;
            if (sid in this.timeouts) {
                clearTimeout(this.timeouts[sid]);
            }
            this.timeouts[sid] = setTimeout(() => {
                delete this.sessions[sid];
                delete this.timeouts[sid];
            }, ttl);
        });
    }
    get(sid) {
        return __awaiter(this, void 0, void 0, function* () {
            sid = this.prefix + sid;
            return this.sessions[sid] && Object.assign({}, this.sessions[sid]);
        });
    }
    destroy(sid) {
        return __awaiter(this, void 0, void 0, function* () {
            sid = this.prefix + sid;
            if (sid in this.timeouts) {
                delete this.sessions[sid];
                clearTimeout(this.timeouts[sid]);
                delete this.timeouts[sid];
            }
        });
    }
}
exports.MemoryStore = MemoryStore;
//# sourceMappingURL=memory.js.map