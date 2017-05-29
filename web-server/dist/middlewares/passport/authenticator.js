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
const http = require("http");
// import { Session } from "../session";
const augmentContex_1 = require("./augmentContex");
const authenticationerror_1 = require("./authenticationerror");
const strategies_1 = require("./strategies");
/**
 * `Authenticator` constructor.
 *
 */
class Authenticator {
    get UserProperty() {
        if (!this.userProperty) {
            this.userProperty = 'user';
        }
        return this.userProperty;
    }
    get User() {
        return this.user;
    }
    set User(val) {
        this.user = val;
    }
    constructor(context) {
        this.strategies = new Map();
        this.serializers = [];
        this.deserializers = [];
        this.infoTransformers = [];
        // this.userProperty = "user";
        augmentContex_1.default(context);
        this.use(new strategies_1.SessionStrategy());
    }
    use(name, strategy) {
        if (strategy === undefined) {
            strategy = name;
            name = strategy.Name;
        }
        if (!name) {
            throw new Error('Authentication strategies must have a name');
        }
        strategy.registerAuthenticator(this);
        this.strategies.set(name, strategy);
        return this;
    }
    /**
     * Un-utilize the `strategy` with given `name`.
     *
     * In typical applications, the necessary authentication strategies are static,
     * configured once and always available.  As such, there is often no need to
     * invoke this function.
     *
     * However, in certain situations, applications may need dynamically configure
     * and de-configure authentication strategies.  The `use()`/`unuse()`
     * combination satisfies these scenarios.
     *
     * Examples:
     *
     *     passport.unuse('legacy-api');
     *
     */
    unuse(name) {
        this.strategies.delete(name);
        return this;
    }
    /**
     * Passport's primary initialization middleware.
     *
     * Intializes Passport for incoming requests, allowing
     * authentication strategies to be applied.
     *
     * If sessions are being utilized, applications must set up Passport with
     * functions to serialize a user into and out of a session.  For example, a
     * common pattern is to serialize just the user ID into the session (due to the
     * fact that it is desirable to store the minimum amount of data in a session).
     * When a subsequent request arrives for the session, the full User object can
     * be loaded from the database by ID.
     *
     * Note that additional middleware is required to persist login state, so we
     * must use the `connect.session()` middleware _before_ `passport.initialize()`.
     *
     * If sessions are being used, this middleware must be in use by the
     * Koa application for Passport to operate.  If the application is
     * entirely stateless (not using sessions), this middleware is not necessary,
     * but its use will not have any adverse impact.
     *
     * Options:
     *   - `userProperty`  Property to set on `ctx.state` upon login, defaults to _user_
     *
     * Examples:
     *     app.use(connect.cookieParser());
     *
     *     app.use(connect.session({ secret: 'keyboard cat' }));
     *     app.use(passport.initialize());
     *     app.use(passport.initialize({ userProperty: 'currentUser' }));
     *     app.use(passport.session());
     *
     *     passport.serializeUser(function(user, done) {
     *       done(null, user.id);
     *     });
     *
     *     passport.deserializeUser(function(id, done) {
     *       User.findById(id, function (err, user) {
     *         done(err, user);
     *       });
     *     });
     *
     */
    initialize(userProperty) {
        this.userProperty = userProperty;
        return (ctx, next) => __awaiter(this, void 0, void 0, function* () {
            ctx.passport = this;
            if (!ctx.session) {
                throw new Error('Session middleware is needed with passport middleware!');
            }
            if (!('passport' in ctx.session)) {
                ctx.session.passport = { user: undefined };
            }
            if (!('message' in ctx.session)) {
                ctx.session.message = {};
            }
            yield next();
        });
    }
    authenticate(strategyNames, options = {}, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }
        let multi = true;
        // Cast `strategy` to an array, allowing authentication to pass through a chain of
        // strategies.  The first strategy to succeed, redirect, or error will halt
        // the chain.  Authentication failures will proceed through each strategy in
        // series, ultimately failing if all strategies fail.
        //
        // This is typically used on API endpoints to allow clients to authenticate
        // using their preferred choice of Basic, Digest, token-based schemes, etc.
        // It is not feasible to construct a chain of multiple strategies that involve
        // redirection (for example both Facebook and Twitter), since the first one to
        // redirect will halt the chain.
        if (typeof strategyNames === 'string') {
            strategyNames = [strategyNames];
            multi = false;
        }
        return (ctx, next) => __awaiter(this, void 0, void 0, function* () {
            // if (http.IncomingMessage.prototype.logIn
            //     && http.IncomingMessage.prototype.logIn !== IncomingMessageExt.logIn) {
            //     require('../framework/connect').__monkeypatchNode();
            // }
            // accumulator for failures from each strategy in the chain
            const failures = [];
            function allFailed() {
                if (callback) {
                    if (!multi) {
                        return callback(null, false, failures[0].challenge, failures[0].status);
                    }
                    else {
                        const challenges = failures.map(f => f.challenge);
                        const statuses = failures.map(f => f.status);
                        return callback(null, false, challenges, statuses);
                    }
                }
                // Strategies are ordered by priority.  For the purpose of flashing a
                // message, the first failure will be displayed.
                // const challenge = (failures[0] || {}).challenge || {};
                if (options.failureMessage && failures[0].challenge.type) {
                    const challenge = failures[0].challenge;
                    if (!(challenge.type in ctx.session.message)) {
                        ctx.session.message[challenge.type] = [];
                    }
                    ctx.session.message[challenge.type].push(challenge.messages);
                }
                if (options.failureRedirect) {
                    return ctx.redirect(options.failureRedirect);
                }
                // When failure handling is not delegated to the application, the default
                // is to respond with 401 Unauthorized.  Note that the WWW-Authenticate
                // header will be set according to the strategies in use (see
                // actions#fail).  If multiple strategies failed, each of their challenges
                // will be included in the response.
                const rchallenge = [];
                let rstatus;
                let status;
                for (const failure of failures) {
                    status = failure.status;
                    rstatus = rstatus || status;
                    if (typeof failure.challenge === 'string') {
                        rchallenge.push(failure.challenge);
                    }
                }
                ctx.status = rstatus || 401;
                if (ctx.status === 401 && rchallenge.length) {
                    ctx.set('WWW-Authenticate', rchallenge);
                }
                if (options.failWithError) {
                    throw new authenticationerror_1.AuthenticationError(http.STATUS_CODES[ctx.status], rstatus);
                }
                // console.log("==================");
                // console.log(http.STATUS_CODES[ctx.status]);
                // ctx.res.statusMessage = http.STATUS_CODES[ctx.status];
                // ctx.response.message = http.STATUS_CODES[ctx.status];
                ctx.res.end(http.STATUS_CODES[ctx.status]);
            }
            for (const strategyName of strategyNames) {
                const strategy = this.strategies.get(strategyName);
                if (!strategy) {
                    throw new Error(`Unknown authentication strategy "${strategyName}"`);
                }
                try {
                    const res = yield strategy.authenticate(ctx, options);
                    switch (res.type) {
                        case strategies_1.ActionType.FAIL: {
                            const { challenge, status } = res;
                            // push this failure into the accumulator and attempt authentication
                            // using the next strategy
                            failures.push({ challenge, status });
                            break;
                        }
                        case strategies_1.ActionType.REDIRECT: {
                            const { url, status } = res;
                            ctx.status = status;
                            ctx.redirect(url);
                            return;
                        }
                        case strategies_1.ActionType.SUCCESS: {
                            const { user, info } = res;
                            if (callback) {
                                return callback(null, user, info);
                            }
                            if (options.successMessage) {
                                if (!(info.type in ctx.session.message)) {
                                    ctx.session.message[info.type] = [];
                                }
                                ctx.session.message[info.type].push(info.message);
                            }
                            if (options.assignProperty) {
                                ctx.state[options.assignProperty] = user;
                                return next();
                            }
                            yield ctx.login(user);
                            if (options.authInfo !== false) {
                                ctx.state.authInfo = yield this.transformAuthInfo(info, ctx);
                            }
                            if (options.successReturnToOrRedirect) {
                                let url = options.successReturnToOrRedirect;
                                if (ctx.session && ctx.session.returnTo) {
                                    url = ctx.session.returnTo;
                                    delete ctx.session.returnTo;
                                }
                                return ctx.redirect(url);
                            }
                            if (options.successRedirect) {
                                return ctx.redirect(options.successRedirect);
                            }
                            return yield next();
                        }
                        case strategies_1.ActionType.PASS:
                        default: {
                            return yield next();
                        }
                    }
                }
                catch (error) {
                    if (callback) {
                        return callback(error);
                    }
                    throw error;
                }
            }
            return allFailed();
        });
    }
    /**
     * Middleware that will authorize a third-party account using the given
     * `strategy` name, with optional `options`.
     *
     * If authorization is successful, the result provided by the strategy's verify
     * callback will be assigned to `ctx.state.account`.  The existing login session and
     * `ctx.state.user` will be unaffected.
     *
     * This function is particularly useful when connecting third-party accounts
     * to the local account of a user that is currently authenticated.
     *
     * Examples:
     *
     *    passport.authorize('twitter-authz', { failureRedirect: '/account' });
     */
    authorize(strategy, options = {}, callback) {
        options.assignProperty = 'account';
        return this.authenticate(strategy, options, callback);
    }
    /**
     * Middleware that will restore login state from a session.
     *
     * Web applications typically use sessions to maintain login state between
     * requests.  For example, a user will authenticate by entering credentials into
     * a form which is submitted to the server.  If the credentials are valid, a
     * login session is established by setting a cookie containing a session
     * identifier in the user's web browser.  The web browser will send this cookie
     * in subsequent requests to the server, allowing a session to be maintained.
     *
     * If sessions are being utilized, and a login session has been established,
     * this middleware will populate `req.user` with the current user.
     *
     * Note that sessions are not strictly required for Passport to operate.
     * However, as a general rule, most web applications will make use of sessions.
     * An exception to this rule would be an API server, which expects each HTTP
     * request to provide credentials in an Authorization header.
     *
     * Examples:
     *
     *     app.use(connect.cookieParser());
     *     app.use(connect.session({ secret: 'keyboard cat' }));
     *     app.use(passport.initialize());
     *     app.use(passport.session());
     *
     * Options:
     *   - `pauseStream`      Pause the request stream before deserializing the user
     *                        object from the session.  Defaults to _false_.  Should
     *                        be set to true in cases where middleware consuming the
     *                        request body is configured after passport and the
     *                        deserializeUser method is asynchronous.
     *
     * @api public
     */
    session(options) {
        return this.authenticate('session', options);
    }
    serializeUser(user, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof user === 'function') {
                return this.serializers.push(user);
            }
            for (const layer of this.serializers) {
                const obj = yield layer(user, ctx);
                if (obj || obj === 0) {
                    return obj;
                }
            }
            throw new Error('Failed to serialize user into session');
        });
    }
    deserializeUser(obj, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof obj === 'function') {
                return this.deserializers.push(obj);
            }
            for (const layer of this.deserializers) {
                const user = yield layer(obj, ctx);
                if (user) {
                    return user;
                }
                else if (user === null || user === false) {
                    return false;
                }
            }
            throw new Error('Failed to deserialize user out of session');
        });
    }
    transformAuthInfo(info, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof info === 'function') {
                return this.infoTransformers.push(info);
            }
            // private implementation that traverses the chain of transformers,
            // attempting to transform auth info
            for (const layer of this.infoTransformers) {
                const tinfo = yield layer(info, ctx);
                if (tinfo) {
                    return tinfo;
                }
            }
            return info;
        });
    }
}
exports.Authenticator = Authenticator;
//# sourceMappingURL=authenticator.js.map