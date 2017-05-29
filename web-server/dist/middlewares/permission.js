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
exports.default = (options = {}) => {
    return (ctx, next) => __awaiter(this, void 0, void 0, function* () {
        if (!ctx.session || !ctx.session.passport || !ctx.session.passport.user) {
            return yield next();
        }
        const username = ctx.session.passport.user.username;
        const user = yield ctx.dataController.getUserByUsername(username);
        const permissions = {};
        if (user && user.courseRoles) {
            const courseRoles = user.courseRoles;
            Object.keys(courseRoles).forEach(course => {
                const role = new Set(courseRoles[course]);
                permissions[course] = role.has('instructor') || role.has('staff');
            });
        }
        console.info('in permissions middleware');
        ctx.session.passport.user.permissions = permissions;
        yield next();
    });
};
//# sourceMappingURL=permission.js.map