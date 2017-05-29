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
class BaseStrategy {
    get Name() {
        return this.name;
    }
    /**
     * Authenticate request.
     *
     * This function must be overridden by subclasses.  In abstract form, it always
     * throws an exception.
     *
     */
    authenticate(ctx, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new PassAction();
        });
    }
    registerAuthenticator(authenticator) {
        this.authenticator = authenticator;
    }
}
exports.BaseStrategy = BaseStrategy;
// tslint:disable:max-classes-per-file
var ActionType;
(function (ActionType) {
    ActionType[ActionType["SUCCESS"] = 0] = "SUCCESS";
    ActionType[ActionType["FAIL"] = 1] = "FAIL";
    ActionType[ActionType["REDIRECT"] = 2] = "REDIRECT";
    ActionType[ActionType["PASS"] = 3] = "PASS";
    ActionType[ActionType["ERROR"] = 4] = "ERROR";
})(ActionType = exports.ActionType || (exports.ActionType = {}));
class BaseAction {
    constructor(type) {
        this.type = type;
    }
}
exports.BaseAction = BaseAction;
/**
 * Pass without making a success or fail decision.
 *
 * Under most circumstances, Strategies should not need to call this
 * function.  It exists primarily to allow previous authentication state
 * to be restored, for example from an HTTP session.
 *
 */
class PassAction extends BaseAction {
    constructor() {
        super(ActionType.PASS);
    }
}
exports.PassAction = PassAction;
/**
 * Fail authentication, with optional `challenge` and `status`, defaulting
 * to 401.
 *
 * Strategies should return this action to fail an authentication attempt.
 *
 * @param {String} challenge
 * @param {Number} status
 * @api public
 */
class FailAction extends BaseAction {
    constructor(challenge, status) {
        super(ActionType.FAIL);
        this.challenge = challenge;
        this.status = status;
    }
}
exports.FailAction = FailAction;
/**
 * Redirect to `url` with optional `status`, defaulting to 302.
 *
 * Strategies should return this function to redirect the user (via their
 * user agent) to a third-party website for authentication.
 *
 * @param {String} url
 * @param {Number} status
 * @api public
 */
class RedirectAction extends BaseAction {
    constructor(url, status = 302) {
        super(ActionType.REDIRECT);
        this.url = url;
        this.status = status;
    }
}
exports.RedirectAction = RedirectAction;
/**
 * Authenticate `user`, with optional `info`.
 *
 * Strategies should return this action to successfully authenticate a
 * user.  `user` should be an object supplied by the application after it
 * has been given an opportunity to verify credentials.  `info` is an
 * optional argument containing additional user information.  This is
 * useful for third-party authentication strategies to pass profile
 * details.
 *
 * @param {Object} user
 * @param {Object} info
 * @api public
 */
class SuccessAction extends BaseAction {
    constructor(user, info) {
        super(ActionType.SUCCESS);
        this.user = user;
        this.info = info;
    }
}
exports.SuccessAction = SuccessAction;
//# sourceMappingURL=base.js.map