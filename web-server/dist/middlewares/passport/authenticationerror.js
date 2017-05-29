"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * `AuthenticationError` error.
 *
 * @api private
 */
class AuthenticationError extends Error {
    constructor(message, status = 401) {
        super(message);
        this.status = status;
        this.name = AuthenticationError.ErrorName;
        Error.captureStackTrace(this, this.constructor);
    }
}
AuthenticationError.ErrorName = 'AuthenticationError';
exports.AuthenticationError = AuthenticationError;
//# sourceMappingURL=authenticationerror.js.map