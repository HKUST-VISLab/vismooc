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
const base64Url_1 = require("./base64Url");
const randomBytes_1 = require("./randomBytes");
function uid(length) {
    return __awaiter(this, void 0, void 0, function* () {
        return base64Url_1.default.escape((yield randomBytes_1.randomBytes(length)).toString('base64'));
    });
}
exports.uid = uid;
function uidSync(length) {
    return base64Url_1.default.escape(randomBytes_1.randomBytesSync(length).toString('base64'));
}
exports.uidSync = uidSync;
//# sourceMappingURL=uid.js.map