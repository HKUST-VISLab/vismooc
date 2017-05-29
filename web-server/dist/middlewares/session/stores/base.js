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
const events_1 = require("events");
exports.CONNECT = 'CONNECT';
exports.DISCONNECT = 'DISCONNECT';
class BaseStore extends events_1.EventEmitter {
    // protected prefix: string;
    constructor(prefix = 'koa:sess') {
        super();
        this.prefix = prefix;
        // this.prefix = prefix;
        // delegate client connect / disconnect event
        // if (typeof store.on === "function") {
        //     this.store.on(EVENT_TYPE_DISCONNECT, this.emit.bind(this, EVENT_TYPE_DISCONNECT));
        //     this.store.on(EVENT_TYPE_CONNECT, this.emit.bind(this, EVENT_TYPE_CONNECT));
        // }
    }
    set(sid, sess, ttl) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ttl) {
                const maxage = (sess.cookie && sess.cookie.maxAge) || 86400000;
                ttl = maxage;
                // if has cookie.expires, ignore cookie.maxage
                if (sess.cookie && sess.cookie.expires) {
                    ttl = Math.ceil(sess.cookie.expires.getTime() - Date.now());
                }
            }
            return ttl;
        });
    }
}
exports.BaseStore = BaseStore;
//# sourceMappingURL=base.js.map