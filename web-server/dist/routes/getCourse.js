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
// import { OAuthReferer } from '../routes/oauth';
function courseIdOf(query) {
    const id = query.courseId;
    if (id && id.indexOf(' ') !== -1) {
        return id.replace(new RegExp(' ', 'gm'), '+');
    }
    return id || null;
}
function getCourseIdFromReferer(referer) {
    let match = null;
    if (referer) {
        match = referer.match(/course-v1:([^\/]+)\//);
    }
    return match && match[1];
}
const getCourseRouters = new Router()
    .get('/getCourseInfo', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    if (ctx.body) {
        return yield next();
    }
    const query = ctx.query;
    const courseId = courseIdOf(query);
    const course = yield ctx.dataController.getCourseById(courseId);
    const videoIds = course.videoIds;
    const videos = (yield ctx.dataController.getVideosByList(courseId, videoIds))
        .map((v) => ({
        courseId,
        name: v.name,
        id: v.originalId,
        duration: v.duration,
        url: v.url || '',
        section: v.section,
        temporalHotness: v.temporalHotness || {},
    }));
    ctx.body = course && {
        id: course.originalId,
        name: course.name,
        instructor: course.instructor,
        url: course.url,
        image: course.courseImageUrl,
        startDate: course.startDate,
        endDate: course.endDate,
        videos,
        description: course.description,
    };
    yield next();
}))
    .get('/getCourseList', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    if (ctx.body) {
        return yield next();
    }
    console.info('in get course list');
    const selectedCourseId = getCourseIdFromReferer(null);
    let permissions = {};
    if (ctx.session && ctx.session.passport && ctx.session.passport.user) {
        ({ permissions = {} } = ctx.session.passport.user);
    }
    console.info(permissions);
    const ret = yield ctx.dataController.getCoursesByList(Object.keys(permissions));
    ctx.body = {
        coursesList: ret.map((course) => ({
            id: course.originalId,
            name: course.name,
            year: course.year,
        })),
        selectedCourseId,
    };
    yield next();
}))
    .get('/getDemographicInfo', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    if (ctx.body) {
        return yield next();
    }
    const query = ctx.query;
    const courseId = courseIdOf(query);
    const course = yield ctx.dataController.getCourseById(courseId);
    const studentIds = course.studentIds;
    // console.info("studentIds", studentIds);
    const students = yield ctx.dataController.getUsersByList(studentIds);
    // console.info("students", students);
    const countryDist = new Map();
    for (const student of students) {
        const country = student.country || 'CHN';
        if (!(country in countryDist)) {
            countryDist[country] = { users: [], count: 0 };
        }
        countryDist[country].count += 1;
        const hashId = crypto.createHash('md5').update(student.originalId).digest('hex');
        countryDist[country].users.push(hashId);
    }
    ctx.body = Object.keys(countryDist).map((key) => ({
        code3: key,
        count: countryDist[key].count,
        users: countryDist[key].users,
    }));
    yield next();
}));
exports.default = getCourseRouters;
//# sourceMappingURL=getCourse.js.map