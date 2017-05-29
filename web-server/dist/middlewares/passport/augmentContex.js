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
/**
 * Intiate a login session for `user`.
 *
 * Options:
 *   - `session`  Save login state in session, defaults to `true`
 *
 * Examples:
 *
 *     await req.logIn(user, { session: false });
 *
 * @api public
 */
function login(user) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.passport) {
            throw new Error('passport.initialize() middleware not in use');
        }
        const property = (this.passport && this.passport.UserProperty);
        this.state[property] = user;
        let obj;
        try {
            obj = yield this.passport.serializeUser(user, this);
        }
        catch (err) {
            this.state[property] = null;
            throw err;
        }
        if (!this.session) {
            throw new Error('Should use session middleware before passport middleware');
        }
        this.session.passport.user = obj;
        return Promise.resolve();
    });
}
/**
 * Terminate an existing login session.
 *
 * @api public
 */
function logout() {
    if (!this.passport || !this.session) {
        return;
    }
    const property = this.passport.UserProperty;
    this.state[property] = null;
    // if (this._passport && this._passport.session) {
    //     delete this._passport.session.user;
    // }
    this.session.passport.user = undefined;
}
/**
 * Test if request is authenticated.
 *
 * @api public
 */
function isAuthenticated() {
    if (!this.passport) {
        return false;
    }
    const property = this.passport.UserProperty;
    return (this.state[property]) ? true : false;
}
/**
 * Test if request is unauthenticated.
 *
 * @api public
 */
function isUnauthenticated() {
    return !this.isAuthenticated();
}
exports.default = (ctx) => {
    // add passport http.IncomingMessage extensions
    if (ctx.hasOwnProperty('login') || ctx.hasOwnProperty('logout') ||
        ctx.hasOwnProperty('isAuthenticated') || ctx.hasOwnProperty('isUnauthenticated')) {
        return;
    }
    Object.defineProperties(ctx, {
        login: {
            value: login,
            writable: false,
            enumerable: false,
        },
        logout: {
            value: logout,
            writable: false,
            enumerable: false,
        },
        isAuthenticated: {
            value: isAuthenticated,
            writable: false,
            enumerable: false,
        },
        isUnauthenticated: {
            value: isUnauthenticated,
            writable: false,
            enumerable: false,
        },
    });
};
//# sourceMappingURL=augmentContex.js.map