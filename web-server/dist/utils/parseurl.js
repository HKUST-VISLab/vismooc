"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const simplePathRegExp = /^(\/\/?(?!\/)[^\?#\s]*)(\?[^#\s]*)?$/;
/**
 * Parse the `req` url with memoization.
 *
 * @param {ServerRequest} req
 * @return {Object}
 * @api public
 */
function parseurl(req) {
    const url = req.url;
    if (url === undefined) {
        // URL is undefined
        return undefined;
    }
    let parsed = req._parsedUrl;
    if (fresh(url, parsed)) {
        // Return cached URL parse
        return parsed;
    }
    // Parse the URL
    parsed = fastparse(url);
    return req._parsedUrl = parsed;
}
exports.parseurl = parseurl;
/**
 * Parse the `req` original url with fallback and memoization.
 *
 * @param {ServerRequest} req
 * @return {Object}
 * @api public
 */
function originalurl(req) {
    const url = req.originalUrl;
    if (typeof url !== 'string') {
        // Fallback
        return parseurl(req);
    }
    let parsed = req._parsedOriginalUrl;
    if (fresh(url, parsed)) {
        // Return cached URL parse
        return parsed;
    }
    // Parse the URL
    parsed = fastparse(url);
    return req._parsedOriginalUrl = parsed;
}
exports.originalurl = originalurl;
/**
 * Parse the `str` url with fast-path short-cut.
 *
 * @param {string} str
 * @return {Object}
 * @api private
 */
function fastparse(str) {
    // Try fast path regexp
    // See: https://github.com/joyent/node/pull/7878
    const simplePath = typeof str === 'string' && simplePathRegExp.exec(str);
    // Construct simple URL
    if (simplePath) {
        const pathname = simplePath[1];
        const search = simplePath[2] || null;
        const url = {
            path: str,
            href: str,
            pathname,
            search,
            query: search && search.substr(1),
            _raw: str,
        };
        return url;
    }
    return url_1.parse(str);
}
/**
 * Determine if parsed is still fresh for url.
 *
 * @param {string} url
 * @param {object} parsedUrl
 * @return {boolean}
 * @api private
 */
function fresh(url, parsedUrl) {
    return typeof parsedUrl === 'object'
        && parsedUrl !== null
        && parsedUrl._raw === url;
}
exports.default = {
    parseurl,
    originalurl,
};
//# sourceMappingURL=parseurl.js.map