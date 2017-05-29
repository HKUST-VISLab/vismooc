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
const crypto = require("crypto");
const Router = require("koa-router");
// import * as Data from "../controllers/data";
const utils_1 = require("../utils");
function courseIdOf(query) {
    const id = query.courseId;
    if (id && id.indexOf(' ') !== -1) {
        return id.replace(new RegExp(' ', 'gm'), '+');
    }
    return id || null;
}
function videoIdOf(query) {
    return query.videoId || null;
}
function startDateOf(query) {
    return query.startDate ? utils_1.date.parseDate(parseInt(query.startDate, 10)) : null;
}
function endDateOf(query) {
    return query.endDate ? utils_1.date.parseDate(parseInt(query.endDate, 10)) : null;
}
const getVideoRouters = new Router()
    .get('/getClicks', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    if (ctx.body) {
        return yield next();
    }
    const query = ctx.query;
    const videoId = videoIdOf(query);
    const courseId = courseIdOf(query);
    const startDateBound = startDateOf(query);
    const endDateBound = endDateOf(query);
    let logs = yield ctx.dataController.getDenselogsById(courseId, videoId);
    logs = logs.filter((d) => (!startDateBound || d.timestamp >= startDateBound) &&
        (!endDateBound || d.timestamp <= endDateBound));
    for (const denselog of logs) {
        for (const click of denselog.clicks) {
            delete click.path;
            if (click.userId) {
                click.userId = crypto.createHash('md5').update(`${click.userId}`).digest('hex');
            }
        }
        delete denselog.__v;
        delete denselog._id;
        delete denselog.courseId;
        delete denselog.videoId;
    }
    ctx.body = logs;
    yield next();
}));
exports.default = getVideoRouters;
//# sourceMappingURL=getVideo.js.map