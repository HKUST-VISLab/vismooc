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
const utils_1 = require("../../../../utils");
class BaseStateStore {
    store(ctx, meta) {
        return __awaiter(this, void 0, void 0, function* () {
            return '';
        });
    }
    verify(ctx, providedState) {
        return __awaiter(this, void 0, void 0, function* () {
            return { result: true, message: '' };
        });
    }
}
exports.BaseStateStore = BaseStateStore;
class SessionStore extends BaseStateStore {
    /**
     * Creates an instance of `SessionStore`.
     *
     * This is the state store implementation for the OAuth2Strategy used when
     * the `state` option is enabled.  It generates a random state and stores it in
     * `req.session` and verifies it when the service provider redirects the user
     * back to the application.
     *
     * This state store requires session support.  If no session exists, an error
     * will be thrown.
     *
     */
    constructor(key) {
        super();
        this.key = key;
    }
    /**
     * Store request state.
     *
     * This implementation simply generates a random string and stores the value in
     * the session, where it will be used for verification when the user is
     * redirected back to the application.
     *
     */
    store(ctx, meta) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ctx.session) {
                throw new Error(`OAuth 2.0 authentication requires session support
             when using state. Did you forget to use session middleware?`);
            }
            const key = this.key;
            const state = utils_1.uidSync(24);
            if (!ctx.session[key]) {
                ctx.session[key] = {};
            }
            ctx.session[key].state = state;
            return state;
        });
    }
    /**
     * Verify request state.
     *
     * This implementation simply compares the state parameter in the request to the
     * value generated earlier and stored in the session.
     *
     */
    verify(ctx, providedState) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ctx.session) {
                throw new Error(`OAuth 2.0 authentication requires session support
            when using state. Did you forget to use express-session middleware?`);
            }
            const key = this.key;
            if (!ctx.session[key]) {
                return {
                    result: false,
                    message: 'Unable to verify authorization request state.',
                };
            }
            const state = ctx.session[key].state;
            if (!state) {
                return {
                    result: false,
                    message: 'Unable to verify authorization request state.',
                };
            }
            delete ctx.session[key].state;
            if (Object.keys(ctx.session[key]).length === 0) {
                delete ctx.session[key];
            }
            if (state !== providedState) {
                return {
                    result: false,
                    message: 'Invalid authorization request state.',
                };
            }
            return { result: true, message: '' };
        });
    }
}
exports.SessionStore = SessionStore;
//# sourceMappingURL=stateStore.js.map