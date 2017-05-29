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
const R = require("ramda");
const databaseManager_1 = require("../database/databaseManager");
const DataSchema = require("../database/dataSchema");
// import { parseDate } from '../utils/date';
/*-----------------Mongo----------------*/
class DataController {
    constructor(database) {
        this.database = database;
        this.getCourseById = R.memoize((id) => __awaiter(this, void 0, void 0, function* () {
            return this.getCoursesById(id)
                .then(this.firstElement);
        }));
        this.getVideoById = R.memoize((id) => __awaiter(this, void 0, void 0, function* () {
            return this.getVideosById(id)
                .then(this.firstElement);
        }));
        this.getUserById = R.memoize((id) => __awaiter(this, void 0, void 0, function* () {
            return this.getUsersById(id)
                .then(this.firstElement);
        }));
        this.getUserByUsername = R.memoize((username) => __awaiter(this, void 0, void 0, function* () {
            return this.getUsersByUsername(username)
                .then(this.firstElement);
        }));
        if (!database) {
            throw new Error(`The database should not be ${database}`);
        }
    }
    getSentimentById(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.database.model(DataSchema.FORUM)
                .where('courseId').equals(courseId)
                .select('courseId createdAt sentiment originalId')
                .exec();
        });
    }
    /*
    outofdate, data schema already changed
        public async getThreadsByUserId(courseId: string, userId: string): Promise<DataSchema.Forum[]> {
            const threads = await this.database.model<DataSchema.Forum, DataSchema.ForumModel>(DataSchema.FORUM)
                .where('courseId').equals(courseId)
                .where('authorId').equals(userId)
                .exec();
            return threads;
        }
    */
    getActivenessByUserId(courseId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.database.model(DataSchema.USERS)
                .where('originalId').equals(userId)
                .exec();
            if (users.length === 0) {
                return null;
            }
            const user = users[0];
            return +user.activeness[courseId];
        });
    }
    /*
        public async getUserActivenessByCourseId(courseId: string, activityThreshold: number = 0) {
            const users = await this.database.model<DataSchema.User, DataSchema.UserModel>(DataSchema.USERS)
                .where(`activeness.${courseId}`).gte(activityThreshold)
                .select('originalId activeness')
                .exec();
            const ret = new Map<string, number>();
            for (const user of users) {
                ret.set(user.originalId, +user.activeness[courseId]);
            }
            return ret;
        }

        public async getUserActivenessByCourseIdCache(courseId: string, activityThreshold: number = 0) {
            const queryStr: string = `getUserActivenessByCourseId#${courseId}_#${activityThreshold}`;
            const retStr: string = await (DatabaseManager.CacheDatabase && DatabaseManager.CacheDatabase.get(queryStr));
            if (retStr) {
                const ret = new Map<string, number>();
                const obj = JSON.parse(retStr);
                Object.keys(obj).forEach(key => ret.set(key, obj[key]));
                return ret;
            } else {
                const ret = await this.getUserActivenessByCourseId(courseId, activityThreshold);
                await DatabaseManager.CacheDatabase.set(queryStr, JSON.stringify(ret));
                return ret;
            }
        }
        */
    getUserGradesByCourseId(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            const course = yield this.getCourseById(courseId);
            const grades = course.grades;
            const ret = new Map();
            Object.keys(grades).forEach(d => ret.set(d, grades[d]));
            return ret;
        });
    }
    /*
        No need to use cache now
        public async getUserGradesByCourseIdCached(courseId: string) {
            const queryStr: string = `getUserGradesByCourseId#${courseId}`;
            const retStr: string = await (DatabaseManager.CacheDatabase && DatabaseManager.CacheDatabase.get(queryStr));
            if (retStr) {
                const ret = new Map<string, number>();
                const obj = JSON.parse(retStr);
                Object.keys(obj).forEach(key => ret.set(key, obj[key]));
                return ret;
            } else {
                const ret = await this.getUserGradesByCourseId(courseId);
                await DatabaseManager.CacheDatabase.set(queryStr, JSON.stringify(ret));
                return ret;
            }
        }
        */
    /*
        public async getTotalGradeByUserId(courseId: string, userId: string): Promise<number> {
            const grades: DataSchema.Grade[] = await this.getGradesByUserId(courseId, userId);
            const maxGrade: Map<string, number> = new Map<string, number>();
            for (const d of grades) {
                const grade = parseFloat(d.grade);
                if (grade > 0) {
                    if (!maxGrade.has(d.courseModule) || maxGrade.get(d.courseModule) < grade) {
                        maxGrade.set(d.courseModule, grade);
                    }
                }
            }
            let sum: number = 0;
            for (const val of maxGrade.values()) {
                sum += val;
            }
            return sum;
        }
    */
    getSocialNetwork(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            const socialNetworkDatas = yield this.database
                .model(DataSchema.SOCIALNETWORK)
                .where('courseId').equals(courseId)
                .exec();
            if (socialNetworkDatas.length === 0) {
                return null;
            }
            else {
                return socialNetworkDatas[0];
            }
        });
    }
    getSocialNetworkCached(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryStr = `getSocialNetwork#${courseId}`;
            const retStr = yield (databaseManager_1.default.CacheDatabase && databaseManager_1.default.CacheDatabase.get(queryStr));
            if (retStr) {
                const ret = JSON.parse(retStr);
                return ret;
            }
            else {
                const ret = yield this.getSocialNetwork(courseId);
                yield databaseManager_1.default.CacheDatabase.set(queryStr, JSON.stringify(ret));
                return ret;
            }
        });
    }
    getCoursesById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.database.model(DataSchema.COURSES)
                .where('originalId').equals(id)
                .exec();
        });
    }
    getCoursesByList(courseIds) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.database.model(DataSchema.COURSES)
                .where('originalId').in(courseIds)
                .exec();
        });
    }
    getVideosById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.database.model(DataSchema.VIDEOS)
                .where('originalId').equals(id)
                .exec();
        });
    }
    getVideosByList(courseId, videoIds) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.database.model(DataSchema.VIDEOS)
                .where('originalId').in(videoIds)
                .exec();
        });
    }
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.database.model(DataSchema.USERS)
                .all();
        });
    }
    getUsersById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.database.model(DataSchema.USERS)
                .where('originalId').equals(id)
                .exec();
        });
    }
    getUsersByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.database.model(DataSchema.USERS)
                .where('username').equals(username)
                .exec();
        });
    }
    getUsersByList(userIds) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.info('The first user is', await this.getAllUsers());
            return yield this.database.model(DataSchema.USERS)
                .where('originalId').in(userIds)
                .exec();
        });
    }
    getDenselogsById(courseId, videoId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.database.model(DataSchema.DENSELOGS)
                .where('courseId').equals(courseId)
                .where('videoId').equals(videoId)
                .exec();
        });
    }
    firstElement(els) {
        return (els && els.length) ? els[0] : null;
    }
}
exports.DataController = DataController;
// export async function getControllerByDb(db1: BaseDatabase, db2: BaseDatabase = null) {
//     const MongoController = {
//         getCoursesById: getCoursesByIdFromMongo,
//         getVideosById: getVideosByIdFromMongo,
//         getUsersById: getUsersByIdFromMongo,
//         getVideosByList: getVideosByListFromMongo,
//         getCoursesByList: getCoursesByListFromMongo,
//         getUsersByList: getUsersByListFromMongo,
//         getDenselogsById: getDenselogsByIdFromMongo,
//         getVideoById: R.memoize(
//             async (id: string) => getVideosByIdFromMongo(id).then(firstElement),
//         ),
//         getUserById: R.memoize(
//             async (id: string) => getUsersByIdFromMongo(id).then(firstElement),
//         ),
//         getCourseById: R.memoize(
//             async (id: string) => getCoursesByIdFromMongo(id).then(firstElement),
//         ),
//     };
//     const MySQLController = {
//         getCoursesById: getCoursesByIdFromMySQL,
//         getVideosById: getVideosByIdFromMySQL,
//         getUsersById: getUsersByIdFromMySQL,
//         getVideosByList: getVideosByListFromMySQL,
//         getCoursesByList: getCoursesByListFromMySQL,
//         getUsersByList: getUsersByListFromMySQL,
//         getDenselogsById: getDenselogsByIdFromMySQL,
//         getVideoById: R.memoize(
//             async (id: string) => getVideosByIdFromMySQL(id).then(firstElement),
//         ),
//         getUserById: R.memoize(
//             async (id: string) => getUsersByIdFromMySQL(id).then(firstElement),
//         ),
//         getCourseById: R.memoize(
//             async (id: string) => getCoursesByIdFromMySQL(id).then(firstElement),
//         ),
//     };
//     const Controller = (database) => {
//         if (database === null) {
//             return {};
//         } else if (database.Type === MONGO) {
//             return MongoController;
//         } else if (database.Type === MYSQL) {
//             return MySQLController;
//         } else {
//             return {};
//         }
//     };
//     const BaseController = Controller(db1);
//     const OptionController = Controller(db2);
//     for (const attr of Object.keys(BaseController)) {
//         if (BaseController[attr] === null) {
//             BaseController[attr] = OptionController[attr];
//         }
//     }
//     return BaseController;
// }
// export async function getCourseStartDate(id: string) {
//     return getCourseById(id)
//         .then((course: any) => course && course.startDate ? course.startDate : 0)
//         .then(parseDate);
// }
// export async function getCourseEndDate(id: string) {
//     return getCourseById(id)
//         .then((course: any) => course && course.endDate ? course.endDate : 0)
//         .then(parseDate);
// }
/*---------------SQL-------------------*/
// const mysqlResourceTypes = [
//     { id: 0, content: 'None', medium: 'None' },
//     { id: 1, content: 'problem', medium: 'text' },
//     { id: 2, content: 'informational', medium: 'text' },
//     { id: 3, content: 'forum', medium: 'text' },
//     { id: 4, content: 'profile', medium: 'None' },
//     { id: 5, content: 'lecture', medium: 'video' },
// ];
// const resourceTypeVideo: number = mysqlResourceTypes[5].id;
// const getDenselogsByIdFromMySQL = null;
// const getUsersByListFromMySQL = null;
// const getUsersByIdFromMySQL = null;
// async function getCoursesByListFromMySQL(courseIds: string[]): Promise<any[]> {
//     const courses = [];
//     for (const id of courseIds) {
//         const course = await getCoursesByIdFromMySQL(id);
//         courses.push(course);
//     }
//     return courses;
// }
// async function getVideosByListFromMySQL(courseId: string, videoIds: string[]): Promise<any> {
//     const videos = await DatabaseManager.Database.model('resources')
//         .where('course_id').equals(courseId)
//         .where('resource_type_id').equals(resourceTypeVideo)
//         .exec();
//     return videos
//         .map((v) => ({
//             courseId: v.courseId as string,
//             name: v.resource_name as string,
//             originalId: v.resource_id as string,
//             duration: v.video_duration as number,
//             url: v.resource_uri || ' as string,
//             section: v.video_section as string,
//             temporalHotness: [], // to be calculated
//         }));
// }
// async function getCoursesByIdFromMySQL(id: string): Promise<any> {
//     /*
//         id: course.originalId as string,
//         name: course.name as string,
//         instructor: course.instructor as string,
//         url: course.url as string,
//         image: course.image as string,
//         startDate: course.startDate as number,
//         endDate: course.endDate as number,
//         videos,
//         description: course.description as string,
//     */
//     const videos = await DatabaseManager.Database.model('resources')
//         .where('course_id').equals(id)
//         .where('resource_type_id').equals(resourceTypeVideo)
//         .select('resource_id')
//         .exec();
//     const course = await DatabaseManager.Database.model('course')
//         .where('course_id').equals(id) // cannot find the course_id in current table
//         .exec();
//     return {
//         id: id as string,
//         name: course.name as string, // cannot find the name in current table
//         instructor: course.instructor as string,
//         url: course.course_url as string,
//         image: course.image as string, // cannot find
//         startDate: course.startDate as number, // cannot find
//         endDate: course.endDate as number, // cannot find
//         videoIds: videos.map(video => video.resource_id),
//         description: course.description as string,
//     };
// }
// async function getVideosByIdFromMySQL(id: string): Promise<any> {
//     const videos = await DatabaseManager.Database.model('resources')
//         .where('recourse_id').equals(id)
//         .where('resource_type_id').equals(resourceTypeVideo)
//         .exec();
//     return videos
//         .map((v) => ({
//             courseId: v.courseId as string,
//             name: v.resource_name as string,
//             originalId: v.resource_id as string,
//             duration: v.video_duration as number,
//             url: v.resource_uri || ' as string,
//             section: v.video_section as string,
//             temporalHotness: [], // to be calculated
//         }));
// }
//# sourceMappingURL=data.js.map