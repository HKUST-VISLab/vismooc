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
const forceLayout_1 = require("../utils/forceLayout");
function courseIdOf(query) {
    const id = query.courseId;
    if (id && id.indexOf(' ') !== -1) {
        return id.replace(new RegExp(' ', 'gm'), '+');
    }
    return id || null;
}
const getForumRouters = new Router()
    .get('/getSentiment', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    if (ctx.body) {
        return yield next();
    }
    const query = ctx.query;
    const courseId = courseIdOf(query);
    if (courseId === null) {
        return yield next();
    }
    const course = yield ctx.dataController.getCourseById(courseId);
    if (course === null) {
        return yield next();
    }
    const startDate = course.startDate;
    const forumData = yield ctx.dataController.getSentimentById(courseId);
    ctx.body = forumData.map(d => ({
        courseId,
        originalId: d.originalId,
        day: 1 + Math.floor((d.createdAt - startDate) / (86400 * 1000)),
        sentiment: d.sentiment,
        timestamp: d.createdAt,
    }));
    return yield next();
}))
    .get('/getSocialNetworkLayout', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    if (ctx.body) {
        return yield next();
    }
    const query = ctx.query;
    const courseId = courseIdOf(query);
    if (courseId === null) {
        return yield next();
    }
    const activenessThreshold = parseFloat(query.activenessThreshold);
    const socialNetworkData = yield ctx.dataController.getSocialNetworkCached(courseId);
    if (!socialNetworkData) {
        return yield next();
    }
    const userGrades = yield ctx.dataController.getUserGradesByCourseId(courseId);
    const userActiveness = new Map(Object.keys(socialNetworkData.activeness)
        .filter(d => socialNetworkData.activeness[d] >= activenessThreshold)
        .map(d => [d, socialNetworkData.activeness[d]]));
    const userDegree = {};
    for (const item of socialNetworkData.socialNetwork) {
        if (!userDegree[item.userId1]) {
            userDegree[item.userId1] = 0;
        }
        userDegree[item.userId1] += 1;
        if (!userDegree[item.userId2]) {
            userDegree[item.userId2] = 0;
        }
        userDegree[item.userId2] += 1;
    }
    const degreeThreshold = 10;
    // const nodeIds = new Set<string>();
    const nodes = new Map();
    const links = new Array();
    let minActiveness = 1000000000000;
    let maxActiveness = -1000000000000;
    for (const item of socialNetworkData.socialNetwork) {
        if (userActiveness.has(item.userId1) && userActiveness.has(item.userId2) && item.userId1 !== item.userId2 &&
            userDegree[item.userId1] > degreeThreshold && userDegree[item.userId2] > degreeThreshold) {
            if (!nodes.has(item.userId1)) {
                nodes.set(item.userId1, {
                    id: item.userId1,
                    activeness: userActiveness.get(item.userId1),
                    grade: userGrades.has(item.userId1) ? userGrades.get(item.userId1) : 0,
                });
            }
            if (!nodes.has(item.userId2)) {
                nodes.set(item.userId2, {
                    id: item.userId2,
                    activeness: userActiveness.get(item.userId2),
                    grade: userGrades.has(item.userId2) ? userGrades.get(item.userId2) : 0,
                });
            }
            links.push({ source: item.userId1, target: item.userId2, weight: item.edgeWeight });
        }
    }
    for (const node of nodes.values()) {
        minActiveness = Math.min(minActiveness, node.activeness);
        maxActiveness = Math.max(maxActiveness, node.activeness);
    }
    ctx.body = Object.assign({}, forceLayout_1.forceLayout({ links, nodes: Array.from(nodes.values()) }), { activenessRange: [minActiveness, maxActiveness] });
    return yield next();
}));
exports.default = getForumRouters;
//# sourceMappingURL=getForum.js.map