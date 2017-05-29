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
const Router = require("koa-router");
function courseIdOf(query) {
    const id = query.courseId;
    if (id && id.indexOf(' ') !== -1) {
        return id.replace(new RegExp(' ', 'gm'), '+');
    }
    return id || null;
}
const verifyRouter = new Router()
    .get('/(.*)', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    console.info('in verify router');
    // to check whether the user login or not
    if (!ctx.session.passport || !ctx.session.passport.user || !ctx.session.passport.user.permissions) {
        ctx.body = 'No Permission_1';
        return yield next();
    }
    console.info('login already');
    // to check whether the user has permission to fetch the data of this course
    const query = ctx.query;
    const courseId = courseIdOf(query);
    if (courseId && !(courseId in ctx.session.passport.user.permissions)) {
        ctx.body = 'No Permission_2';
        return yield next();
    }
    return yield next();
}));
exports.default = verifyRouter;
//# sourceMappingURL=verify.js.map