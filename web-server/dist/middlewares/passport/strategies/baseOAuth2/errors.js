"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * `AuthorizationError` error.
 *
 * AuthorizationError represents an error in response to an authorization
 * request.  For details, refer to RFC 6749, section 4.1.2.1.
 *
 * References:
 *   - [The OAuth 2.0 Authorization Framework](http://tools.ietf.org/html/rfc6749)
 *
 */
class AuthorizationError extends Error {
    constructor(message, uri, code = 'server_error', status) {
        super(message);
        this.uri = uri;
        this.code = code;
        this.status = status;
        this.name = AuthorizationError.ErrorName;
        if (!status) {
            switch (code) {
                case 'access_denied':
                    this.status = 403;
                    break;
                case 'server_error':
                    this.status = 502;
                    break;
                case 'temporarily_unavailable':
                    this.status = 503;
                    break;
                default: this.status = 500;
            }
        }
        Error.captureStackTrace(this, this.constructor);
    }
}
AuthorizationError.ErrorName = 'AuthorizationError';
exports.AuthorizationError = AuthorizationError;
/**
 * `TokenError` error.
 *
 * TokenError represents an error received from a token endpoint.  For details,
 * refer to RFC 6749, section 5.2.
 *
 * References:
 *   - [The OAuth 2.0 Authorization Framework](http://tools.ietf.org/html/rfc6749)
 *
 * @api public
 */
class TokenError extends Error {
    constructor(message, uri, code = 'invalid_requret', status = 500) {
        super(message);
        this.uri = uri;
        this.code = code;
        this.status = status;
        this.name = TokenError.ErrorName;
        Error.captureStackTrace(this, this.constructor);
    }
}
TokenError.ErrorName = 'OAuth2TokenError';
exports.TokenError = TokenError;
//# sourceMappingURL=errors.js.map