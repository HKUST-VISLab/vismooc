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
const url_1 = require("url");
const oauth2_1 = require("../../../../utils/oauth2");
const base_1 = require("../base");
const errors_1 = require("./errors");
const stateStore_1 = require("./stateStore");
/**
 * Creates an instance of `OAuth2Strategy`.
 *
 * The OAuth 2.0 authentication strategy authenticates requests using the OAuth
 * 2.0 framework.
 *
 * OAuth 2.0 provides a facility for delegated authentication, whereby users can
 * authenticate using a third-party service such as Facebook.  Delegating in
 * this manner involves a sequence of events, including redirecting the user to
 * the third-party service for authorization.  Once authorization has been
 * granted, the user is redirected back to the application and an authorization
 * code can be used to obtain credentials.
 *
 * Applications must supply a `verify` callback, for which the function
 * signature is:
 *
 *     function(accessToken, refreshToken, profile, done) { ... }
 *
 * The verify callback is responsible for finding or creating the user, and
 * invoking `done` with the following arguments:
 *
 *     done(err, user, info);
 *
 * `user` should be set to `false` to indicate an authentication failure.
 * Additional `info` can optionally be passed as a third argument, typically
 * used to display informational messages.  If an exception occured, `err`
 * should be set.
 *
 * Params:
 *
 *   - `authorizationURL`  URL used to obtain an authorization grant
 *   - `tokenURL`          URL used to obtain an access token
 *   - `clientId`          identifies client to service provider
 *   - `clientSecret`      secret used to establish ownership of the client identifer
 *   - `callbackURL`       URL to which the service provider will redirect the user after obtaining authorization
 *   - `passReqToCallback` when `true`, `req` is the first argument to the verify callback (default: `false`)
 *
 * Examples:
 *
 *     passport.use(new OAuth2Strategy({
 *         authorizationURL: 'https://www.example.com/oauth2/authorize',
 *         tokenURL: 'https://www.example.com/oauth2/token',
 *         clientId: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/example/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 */
class BaseOAuth2Strategy extends base_1.BaseStrategy {
    constructor(clientId, authorizationURL, tokenURL, verify, skipUserProfile = false, scopeSeparator = ' ', callbackURL, scope, sessionKey, 
        // private trustProxy?: string,
        clientSecret = '', customHeaders, stateStore) {
        super();
        this.clientId = clientId;
        this.authorizationURL = authorizationURL;
        this.tokenURL = tokenURL;
        this.verify = verify;
        this.skipUserProfile = skipUserProfile;
        this.scopeSeparator = scopeSeparator;
        this.callbackURL = callbackURL;
        this.scope = scope;
        this.sessionKey = sessionKey;
        this.name = 'oauth2';
        // NOTE: The _oauth2 property is considered "protected".  Subclasses are
        //       allowed to use it when making protected resource requests to retrieve
        //       the user profile.
        this.oauth2 = new oauth2_1.OAuth2(clientId, clientSecret, '', authorizationURL, tokenURL, customHeaders);
        this.sessionKey = sessionKey || ('oauth2:' + url_1.parse(authorizationURL).hostname);
        if (stateStore instanceof stateStore_1.BaseStateStore) {
            this.stateStore = stateStore;
        }
        else {
            if (stateStore) {
                this.stateStore = new stateStore_1.SessionStore(this.sessionKey);
            }
            else {
                this.stateStore = new stateStore_1.BaseStateStore();
            }
        }
    }
    authenticate(ctx, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (ctx.query && ctx.query.error) {
                if (ctx.query.error === 'access_denied') {
                    return new base_1.FailAction(ctx.query.error_description, 401);
                }
                throw new errors_1.AuthorizationError(ctx.query.error_description, ctx.query.error_uri, ctx.query.error);
            }
            let callbackURL = options.callbackURL || this.callbackURL;
            if (callbackURL) {
                const parsed = url_1.parse(callbackURL);
                if (!parsed.protocol) {
                    // The callback URL is relative, resolve a fully qualified URL from the
                    // URL of the originating request.
                    callbackURL = url_1.resolve(ctx.request.origin, callbackURL);
                }
            }
            const meta = {
                authorizationURL: this.authorizationURL,
                tokenURL: this.tokenURL,
                clientId: this.clientId,
            };
            if (ctx.query && ctx.query.code) {
                const state = ctx.query.state;
                const { result: verifiedResult, message: verifiedMsg } = yield this.stateStore.verify(ctx, state);
                if (!verifiedResult) {
                    return new base_1.FailAction(verifiedMsg, 403);
                }
                const code = ctx.query.code;
                const params = this.tokenParams(options);
                params.grant_type = 'authorization_code';
                if (callbackURL) {
                    params.redirect_uri = callbackURL;
                }
                let accessToken;
                let refreshToken;
                let accessTokenResult;
                try {
                    ({
                        accessToken,
                        refreshToken,
                        result: accessTokenResult,
                    } = yield this.oauth2.getOAuthAccessToken(code, params));
                }
                catch (err) {
                    throw this.parseOAuthError(err);
                }
                const profile = yield this.loadUserProfile(accessToken);
                const { user, info } = yield this.verify(accessToken, refreshToken, accessTokenResult, profile);
                if (!user) {
                    // TODO, not sure 401 is the correct meaning
                    return new base_1.FailAction(info, 401);
                }
                return new base_1.SuccessAction(user, info);
            }
            else {
                const params = this.authorizationParams(options);
                params.response_type = 'code';
                if (callbackURL) {
                    params.redirect_uri = callbackURL;
                }
                let scope = options.scope || this.scope;
                if (scope) {
                    if (Array.isArray(scope)) {
                        scope = scope.join(this.scopeSeparator);
                    }
                    params.scope = scope;
                }
                let state = options.state;
                if (state) {
                    params.state = state;
                }
                else {
                    state = yield this.stateStore.store(ctx, meta);
                    if (state) {
                        params.state = state;
                    }
                }
                const parsed = url_1.parse(this.oauth2.AuthorizeUrl, true);
                parsed.query = Object.assign({}, parsed.query, params);
                parsed.query.client_id = this.oauth2.ClientId;
                delete parsed.search;
                const location = url_1.format(parsed);
                return new base_1.RedirectAction(location);
            }
        });
    }
    /**
     * Retrieve user profile from service provider.
     *
     * OAuth 2.0-based authentication strategies can overrride this function in
     * order to load the user's profile from the service provider.  This assists
     * applications (and users of those applications) in the initial registration
     * process by automatically submitting required information.
     */
    userProfile(accessToken) {
        return __awaiter(this, void 0, void 0, function* () {
            return {};
        });
    }
    /**
     * Return extra parameters to be included in the authorization request.
     *
     * Some OAuth 2.0 providers allow additional, non-standard parameters to be
     * included when requesting authorization.  Since these parameters are not
     * standardized by the OAuth 2.0 specification, OAuth 2.0-based authentication
     * strategies can overrride this function in order to populate these parameters
     * as required by the provider.
     *
     */
    authorizationParams(options) {
        return {};
    }
    /**
     * Return extra parameters to be included in the token request.
     *
     * Some OAuth 2.0 providers allow additional, non-standard parameters to be
     * included when requesting an access token.  Since these parameters are not
     * standardized by the OAuth 2.0 specification, OAuth 2.0-based authentication
     * strategies can overrride this function in order to populate these parameters
     * as required by the provider.
     *
     */
    tokenParams(options) {
        return {};
    }
    /**
     * Parse error response from OAuth 2.0 endpoint.
     *
     * OAuth 2.0-based authentication strategies can overrride this function in
     * order to parse error responses received from the token endpoint, allowing the
     * most informative message to be displayed.
     *
     * If this function is not overridden, the body will be parsed in accordance
     * with RFC 6749, section 5.2.
     *
     */
    parseOAuthError(err) {
        let e;
        if (err instanceof oauth2_1.OAuth2Error) {
            try {
                const json = JSON.parse(err.message);
                if (json.error) {
                    e = new errors_1.TokenError(`Failed to obtain access token:${json.error_description}`, json.error_uri, json.error, err.status);
                }
            }
            catch (_) {
                console.warn('============This error can be ignored==============');
                console.warn(_);
                console.warn('===================================================');
            }
        }
        if (!e) {
            err.message = `Failed to obtain access token:${err.message}`;
            e = err;
        }
        return e;
    }
    /**
     * Load user profile, contingent upon options.
     *
     */
    loadUserProfile(accessToken) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.skipUserProfile) {
                return Promise.resolve(null);
            }
            return yield this.userProfile(accessToken);
        });
    }
}
exports.BaseOAuth2Strategy = BaseOAuth2Strategy;
//# sourceMappingURL=strategy.js.map