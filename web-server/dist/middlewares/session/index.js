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
const utils_1 = require("../..//utils");
const stores_1 = require("./stores");
const defaultCookie = {
    httpOnly: true,
    maxAge: 86400000,
    overwrite: true,
    path: '/',
    secure: false,
    signed: false,
};
const AVAILABEL = 'AVAILABEL';
const PENDING = 'PENDING';
const UNAVAILABLE = 'UNAVAILABLE';
function defaultErrorHanlder(err, type, ctx) {
    err.name = 'session middleware ' + type + ' error';
    throw err;
}
function defaultGenSid(ctx, length) {
    return utils_1.uidSync(length);
}
/**
 * get the hash of a session include cookie options.
 */
function hash(sess) {
    return utils_1.crc32.signed(JSON.stringify(sess));
}
/**
 * check url match cookie's path
 */
function matchPath(ctx, cookiePath = '/') {
    const pathname = utils_1.parseurl.parseurl(ctx).pathname;
    if (cookiePath === '/') {
        return true;
    }
    if (pathname.indexOf(cookiePath) !== 0) {
        // cookie path does not match
        return false;
    }
    return true;
}
function getSessionId(ctx, key, cookieOptions) {
    return ctx.cookies.get(key, cookieOptions);
}
function setSessionId(ctx, key, sid, cookie) {
    ctx.cookies.set(key, sid, cookie);
}
function resetSessionId(ctx, key) {
    ctx.cookies.set(key, null);
}
function generateSession(cookieOptions) {
    return { cookie: Object.assign({}, defaultCookie, cookieOptions) };
}
/**
 * setup session store with the given `options`
 * @param {Object} options
 *   - [`key`] cookie name, defaulting to `koa.sid`
 *   - [`store`] session store instance, default is a MemoryStore
 *   - [`reconnectTimeout`] store reconnectTimeout in `ms`, default is oneday
 *   - [`cookieOptions`] session cookie settings, default is { signed: true}
 *   - [`defer`] defer get session, you should `await this.session` to get the session if
 *      defer is true, default is false
 *   - [`rolling`]  rolling session, always reset the cookie and sessions, default is false
 *   - [`allowEmpty`] allow session empty, default is false
 *   - [`genSid`] you can use your own generator for sid
 *   - [`errorHanlder`] handler for session store get or set error
 *   - [`valid`] valid(ctx, session), valid session value before use it
 *   - [`beforeSave`] beforeSave(ctx, session), hook before save session
 */
function session(options = {}) {
    const key = options.key || 'koa.sid';
    const store = options.store || new stores_1.MemoryStore(key);
    const reconnectTimeout = options.reconnectTimeout || 10000;
    const cookieOptions = options.cookieOptions || { signed: true };
    const defer = options.defer || false;
    const rolling = options.rolling || false;
    const allowEmpty = options.allowEmpty || false;
    const genSid = options.genSid || defaultGenSid;
    const errorHandler = options.errorHandler || defaultErrorHanlder;
    const valid = options.valid || (() => true);
    const beforeSave = options.beforeSave || (() => undefined);
    let storeStatus = AVAILABEL;
    let waitStore = () => __awaiter(this, void 0, void 0, function* () { return Promise.resolve({}); });
    // reconnect when disconnect
    store.on(stores_1.DISCONNECT, () => {
        if (storeStatus !== AVAILABEL) {
            return;
        }
        storeStatus = PENDING;
        waitStore = () => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    // console.log("Timeout!!!!!!");
                    storeStatus = UNAVAILABLE;
                    reject(new Error('timeout:session store is unavailable'));
                }, reconnectTimeout);
                store.once(stores_1.CONNECT, resolve);
            });
        });
    });
    store.on(stores_1.CONNECT, () => {
        storeStatus = AVAILABEL;
        waitStore = () => __awaiter(this, void 0, void 0, function* () { return Promise.resolve({}); });
    });
    // save empty session hash for compare
    const EMPTY_SESSION_HASH = hash(generateSession(cookieOptions));
    return defer ? deferSession : session;
    /**
     *   get session from store
     *   get sessionId from cookie
     *   save sessionId into context
     *   get session from store
     */
    function getSession(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!matchPath(ctx, cookieOptions.path)) {
                return;
            }
            if (storeStatus === PENDING) {
                // store is disconnect and pending;
                yield waitStore();
            }
            else if (storeStatus === UNAVAILABLE) {
                // store is unavailable
                throw new Error('session store is unavailable');
            }
            if (!ctx.sessionId) {
                ctx.sessionId = getSessionId(ctx, key, cookieOptions);
            }
            let session;
            let isNew = false;
            if (!ctx.sessionId) {
                // session id not exist, generate a new one
                session = generateSession(cookieOptions);
                ctx.sessionId = genSid(ctx, 24);
                // now the ctx.cookies.get(key) is null
                isNew = true;
            }
            else {
                try {
                    session = yield store.get(ctx.sessionId);
                }
                catch (err) {
                    if (err.code === 'ENOENT') {
                        console.warn('get session error, code = ENOENT');
                    }
                    else {
                        console.warn('get session error: ', err.message);
                        errorHandler(err, 'get', ctx);
                    }
                }
            }
            // make sure the session is still valid
            if (!session || !valid(ctx, session)) {
                // session is empty or invalid
                session = generateSession(cookieOptions);
                ctx.sessionId = genSid(ctx, 24);
                // now the ctx.cookies.get(key) is null
                resetSessionId(ctx, key);
                isNew = true;
            }
            // get the originHash
            const originalHash = !isNew && hash(session);
            return {
                originalHash,
                session,
                isNew,
            };
        });
    }
    /**
     * after everything done, refresh the session
     *   if session === null; delete it from store
     *   if session is modified, update cookie and store
     */
    function refreshSession(ctx, session, originalHash, isNew) {
        return __awaiter(this, void 0, void 0, function* () {
            // reject any session changes, and do not update session expiry
            if (ctx.sessionSave === false) {
                console.warn('session save disabled');
                return;
            }
            // delete session
            if (!session) {
                if (!isNew) {
                    console.warn('session set to null, destroy session: %s', ctx.sessionId);
                    resetSessionId(ctx, key);
                    return yield store.destroy(ctx.sessionId);
                }
                console.warn('a new session and set to null, ignore destroy');
                return;
            }
            // force saving non-empty session
            if (ctx.sessionSave === true) {
                console.warn('session save forced');
                return yield saveNow(ctx, ctx.sessionId, session);
            }
            const newHash = hash(session);
            // if new session and not modified, just ignore
            if (!allowEmpty && isNew && newHash === EMPTY_SESSION_HASH) {
                // new session and do not modified
                return;
            }
            // rolling session will always reset cookie and session
            if (!rolling && newHash === originalHash) {
                // session not modified
                return;
            }
            // session modified
            yield saveNow(ctx, ctx.sessionId, session);
        });
    }
    function saveNow(ctx, sid, session) {
        return __awaiter(this, void 0, void 0, function* () {
            // custom before save hook
            beforeSave(ctx, session);
            // update session
            try {
                yield store.set(sid, session);
                setSessionId(ctx, key, sid, session.cookie);
                // saved
            }
            catch (err) {
                console.warn('set session error: ', err.message);
                errorHandler(err, 'set', ctx);
            }
        });
    }
    /**
     * common session middleware
     * each request will generate a new session
     *
     * ```
     * let session = this.session;
     * ```
     */
    function session(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // ctx.sessionStore = store;
            // Object.defineProperty(ctx, "sessionStore", {
            //     enumerable: true,
            //     value: store,
            //     writable: false,
            // });
            if (ctx.hasOwnProperty('session')) {
                return yield next();
            }
            const result = yield getSession(ctx);
            if (!result) {
                return yield next();
            }
            // define API's
            Object.defineProperties(ctx, {
                session: {
                    enumerable: true,
                    value: result.session,
                    writable: true,
                },
                sessionStore: {
                    enumerable: true,
                    value: store,
                    writable: false,
                },
                sessionSave: {
                    enumerable: true,
                    value: null,
                    writable: true,
                },
                regenerateSession: {
                    enumerable: true,
                    value() {
                        return __awaiter(this, void 0, void 0, function* () {
                            // regenerating session
                            if (!result.isNew) {
                                // destroy the old session
                                yield store.destroy(this.sessionId);
                            }
                            this.session = generateSession(cookieOptions);
                            this.sessionId = genSid(this, 24);
                            resetSessionId(this, key);
                            result.isNew = true;
                            return this.session;
                        });
                    },
                    writable: false,
                },
            });
            // make sure `refreshSession` always called
            let firstError = null;
            try {
                yield next();
            }
            catch (err) {
                console.warn('next logic error: %s', err.message);
                firstError = err;
            }
            // can't use finally because `refreshSession` is async
            try {
                yield refreshSession(ctx, ctx.session, result.originalHash, result.isNew);
            }
            catch (err) {
                console.warn('refresh session error: %s', err.message);
                if (firstError) {
                    ctx.app.emit('error', err, ctx);
                }
                firstError = firstError || err;
            }
            if (firstError) {
                throw firstError;
            }
        });
    }
    /**
     * defer session middleware
     * only generate and get session when request use session
     *
     * ```
     * let session = await this.session;
     * ```
     */
    function deferSession(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // Object.defineProperty(ctx, "sessionStore", {
            //     enumerable: true,
            //     value: store,
            //     writable: false,
            //     configurable: true,
            // });
            if (ctx.hasOwnProperty('session')) {
                return yield next();
            }
            let isNew = false;
            let originalHash = null;
            let touchSession = false;
            let getter = false;
            // if path not match
            if (!matchPath(ctx, cookieOptions.path)) {
                return yield next();
            }
            Object.defineProperties(ctx, {
                _session: {
                    enumerable: false,
                    value: null,
                    writable: true,
                },
                session: {
                    get() {
                        return __awaiter(this, void 0, void 0, function* () {
                            if (touchSession) {
                                return this._session;
                            }
                            touchSession = true;
                            getter = true;
                            const result = yield getSession(this);
                            // if cookie path not match
                            // this route's controller should never use session
                            if (!result) {
                                return;
                            }
                            originalHash = result.originalHash;
                            isNew = result.isNew;
                            this._session = result.session;
                            return this._session;
                        });
                    },
                    set(val) {
                        touchSession = true;
                        this._session = val;
                    },
                },
                sessionSave: {
                    enumerable: true,
                    value: null,
                    writable: true,
                },
                sessionStore: {
                    enumerable: true,
                    value: store,
                    writable: false,
                },
                regenerateSession: {
                    enumerable: true,
                    value() {
                        return __awaiter(this, void 0, void 0, function* () {
                            // make sure that the session has been loaded
                            yield this.session;
                            // regenerating session
                            if (!isNew) {
                                // destroy the old session
                                yield store.destroy(this.sessionId);
                            }
                            this.session = generateSession(cookieOptions);
                            this.sessionId = genSid(this, 24);
                            resetSessionId(this, key);
                            isNew = true;
                            return yield this.session;
                        });
                    },
                    writable: false,
                },
            });
            yield next();
            if (touchSession) {
                // if only this.session=, need try to decode and get the sessionID
                if (!getter) {
                    ctx.sessionId = getSessionId(ctx, key, cookieOptions);
                }
                yield refreshSession(ctx, yield ctx.session, originalHash, isNew);
            }
        });
    }
}
exports.default = session;
var stores_2 = require("./stores");
exports.BaseStore = stores_2.BaseStore;
exports.MemoryStore = stores_2.MemoryStore;
exports.RedisStore = stores_2.RedisStore;
exports.CONNECT = stores_2.CONNECT;
exports.DISCONNECT = stores_2.DISCONNECT;
//# sourceMappingURL=index.js.map