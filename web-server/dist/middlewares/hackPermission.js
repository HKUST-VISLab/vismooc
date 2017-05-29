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
const databaseManager_1 = require("../database/databaseManager");
const DataSchema = require("../database/dataSchema");
exports.default = (options = {}) => {
    return (ctx, next) => __awaiter(this, void 0, void 0, function* () {
        if (!ctx.session) {
            ctx.session = {};
        }
        if (!ctx.session.passport) {
            ctx.session.passport = { user: {} };
        }
        if (!ctx.session.passport.user) {
            ctx.session.passport.user = {};
        }
        const courses = yield databaseManager_1.default.Database
            .model(DataSchema.COURSES)
            .all();
        // console.info(courses);
        ctx.session.passport.user.permissions = courses.reduce((o, c) => {
            o[c.originalId] = true;
            return o;
        }, {});
        // console.info(ctx.session.passport.user.permission);
        return yield next();
    });
};
//# sourceMappingURL=hackPermission.js.map