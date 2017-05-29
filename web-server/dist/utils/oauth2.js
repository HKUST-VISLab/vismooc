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
const https = require("https");
const querystring = require("querystring");
const URL = require("url");
class OAuth2Error {
    constructor(status, message) {
        this.status = status;
        this.message = message;
    }
}
exports.OAuth2Error = OAuth2Error;
class OAuth2 {
    constructor(clientId, clientSecret, baseSite, authorizeUrl = '/oauth/authorize', accessTokenUrl = '/oauth/access_token', customHeader = {}) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.baseSite = baseSite;
        this.authorizeUrl = authorizeUrl;
        this.accessTokenUrl = accessTokenUrl;
        this.customHeader = customHeader;
        this.accessTokenName = 'access_token';
        this.authMethod = 'Bearer';
        this.useAuthorizationHeaderForGET = false;
        this.agent = undefined;
    }
    // Allows you to set an agent to use instead of the default HTTP or
    // HTTPS agents. Useful when dealing with your own certificates.
    set Agent(agent) {
        this.agent = agent;
    }
    get Agent() {
        return this.agent;
    }
    // This 'hack' method is required for sites that don't use
    // 'access_token' as the name of the access token (for requests).
    // ( http://tools.ietf.org/html/draft-ietf-oauth-v2-16#section-7 )
    // it isn't clear what the correct value should be atm, so allowing
    // for specific (temporary?) override for now.
    set AccessTokenName(name) {
        this.accessTokenName = name;
    }
    get AccessTokenName() {
        return this.accessTokenName;
    }
    // Sets the authorization method for Authorization header.
    // e.g. Authorization: Bearer <token>  # "Bearer" is the authorization method.
    set AuthMethod(authMethod) {
        this.authMethod = authMethod;
    }
    get AuthMethod() {
        return this.authMethod;
    }
    // If you use the OAuth2 exposed 'get' method (and don't construct your own _request call )
    // this will specify whether to use an 'Authorize' header instead of passing the access_token as a query parameter
    set UseAuthorizationHeaderForGET(useIt) {
        this.useAuthorizationHeaderForGET = useIt;
    }
    get UseAuthorizationHeaderForGET() {
        return this.useAuthorizationHeaderForGET;
    }
    get ClientId() {
        return this.clientId;
    }
    get AuthorizeUrl() {
        return this.authorizeUrl;
    }
    get AccessTokenUrl() {
        return `${this.baseSite}${this.accessTokenUrl}`; /* + "?" + querystring.stringify(params); */
    }
    // Build the authorization header. In particular, build the part after the colon.
    // e.g. Authorization: Bearer <token>  # Build "Bearer <token>"
    buildAuthHeader(token) {
        return `${this.authMethod} ${token}`;
    }
    getAuthorizeUrl(params = {}) {
        params.client_id = this.clientId;
        return `${this.baseSite}${this.authorizeUrl}?${querystring.stringify(params)}`;
    }
    getOAuthAccessToken(code, params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            params.client_id = this.clientId;
            params.client_secret = this.clientSecret;
            const codeParam = (params.grant_type === 'refresh_token') ? 'refresh_token' : 'code';
            params[codeParam] = code;
            const postData = querystring.stringify(params);
            const postHeaders = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
            const { result } = yield this.request('POST', this.AccessTokenUrl, postHeaders, postData, null);
            let data;
            try {
                // As of http://tools.ietf.org/html/draft-ietf-oauth-v2-07
                // responses should be in JSON
                data = JSON.parse(result);
            }
            catch (error) {
                // .... However both Facebook + Github currently use rev05 of the spec
                // and neither seem to specify a content-type correctly in their response headers :(
                // clients of these services will suffer a *minor* performance cost of the exception
                // being thrown
                data = querystring.parse(result);
            }
            const accessToken = data[this.AccessTokenName];
            if (!accessToken) {
                throw new OAuth2Error(400, JSON.stringify(params));
            }
            const refreshToken = data.refresh_token;
            delete data.refresh_token;
            return {
                accessToken,
                refreshToken,
                result: data,
            };
        });
    }
    get(url, accessToken) {
        return __awaiter(this, void 0, void 0, function* () {
            let headers = {};
            if (this.useAuthorizationHeaderForGET) {
                headers = { Authorization: this.buildAuthHeader(accessToken) };
                accessToken = null;
            }
            return yield this.request('GET', url, headers, '', accessToken);
        });
    }
    request(method, url, headers = {}, postBody, accessToken) {
        const parsedUrl = URL.parse(url, true);
        if (parsedUrl.protocol === 'https:' && !parsedUrl.port) {
            parsedUrl.port = '443';
        }
        const realHeaders = Object.assign({}, this.customHeader, headers);
        realHeaders.Host = parsedUrl.host;
        if (!realHeaders['User-Agent']) {
            realHeaders['User-Agent'] = 'Node-oauth';
        }
        realHeaders['Content-Length'] = 0;
        if (postBody) {
            realHeaders['Content-Length'] = Buffer.isBuffer(postBody) ? postBody.length :
                Buffer.byteLength(postBody);
        }
        if (accessToken && !('Authorization' in realHeaders)) {
            // It seems that the default value of .query return by URL.parse is {}.
            // if (!parsedUrl.query) {
            //     parsedUrl.query = {};
            // }
            parsedUrl.query[this.accessTokenName] = accessToken;
        }
        let queryStr = querystring.stringify(parsedUrl.query);
        if (queryStr) {
            queryStr = '?' + queryStr;
        }
        const options = {
            protocol: parsedUrl.protocol,
            host: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.pathname + queryStr,
            method,
            headers: realHeaders,
        };
        return new Promise((resolve, reject) => {
            this.executeRequest(options, postBody, (err, result, response) => err ? reject(err) : resolve({ result, response }));
        });
    }
    executeRequest(options, postBody, callback) {
        let callbackCalled = false;
        let result = '';
        // set the agent on the request options
        if (this.agent) {
            options.agent = this.agent;
        }
        const request = options.protocol !== 'https:' ? http.request(options) : https.request(options);
        request.on('response', (response) => {
            response.on('data', (chunk) => {
                result += chunk;
            });
            response.addListener('end', () => {
                if (!callbackCalled) {
                    callbackCalled = true;
                    if (!(response.statusCode >= 200 && response.statusCode <= 299) &&
                        (response.statusCode !== 301) && (response.statusCode !== 302)) {
                        callback(new OAuth2Error(response.statusCode, result));
                    }
                    else {
                        callback(null, result, response);
                    }
                }
            });
        });
        request.on('error', (e) => {
            callbackCalled = true;
            callback(e);
        });
        if ((options.method === 'POST' || options.method === 'PUT') && postBody) {
            request.write(postBody);
        }
        request.end();
    }
}
exports.OAuth2 = OAuth2;
//# sourceMappingURL=oauth2.js.map