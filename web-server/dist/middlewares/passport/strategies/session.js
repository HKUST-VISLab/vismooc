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
class SessionStrategy extends base_1.BaseStrategy {
    /**
     * `SessionStrategy` constructor.
     *
     */
    constructor() {
        super();
        this.name = 'session';
    }
    /**
     * Authenticate request based on the current session state.
     *
     * The session authentication strategy uses the session to restore any login
     * state across requests.  If a login session has been established, `req.user`
     * will be populated with the current user.
     *
     * This strategy is registered automatically by Passport.
     *
     */
    authenticate(ctx, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ctx.passport) {
                throw new Error('passport.initialize() middleware not in use');
            }
            let su;
            if (ctx.session.passport) {
                su = ctx.session.passport.user;
            }
            if (su || su === 0) {
                // NOTE: Stream pausing is desirable in the case where later middleware is
                //       listening for events emitted from request.  For discussion on the
                //       matter, refer to: https://github.com/jaredhanson/passport/pull/106
                const user = ctx.passport.deserializeUser(su, ctx);
                if (!user) {
                    ctx.session.passport.user = undefined;
                    return new base_1.PassAction();
                }
                const property = ctx.passport.UserProperty;
                ctx.state[property] = user;
            }
            return new base_1.PassAction();
        });
    }
}
exports.SessionStrategy = SessionStrategy;
//# sourceMappingURL=session.js.map