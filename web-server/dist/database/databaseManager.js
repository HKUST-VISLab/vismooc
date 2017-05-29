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
const mongoose = require("mongoose");
const DataSchema = require("../database/dataSchema");
const init_1 = require("../init");
const mongo_1 = require("./mongo");
const redis_1 = require("./redis");
let cacheDatabase;
let database;
let courseModel;
let enrollmentModel;
let userModel;
let videoModel;
let logModel;
let denseLogModel;
let forumModel;
let socialNetworkModel;
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        yield initMongo();
        yield initCacheDatabase();
    });
}
function initCacheDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!cacheDatabase) {
            cacheDatabase = new redis_1.Redis(init_1.CONFIG.redis);
            yield cacheDatabase.flushall();
        }
    });
}
function initMongo() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!database) {
            mongoose.Promise = global.Promise;
            const { host, port, name } = init_1.CONFIG.mongo;
            const db = new mongo_1.MongoDatabase(host, port, name);
            yield db.open();
            console.info('open db success');
            courseModel = db.model(DataSchema.COURSES, DataSchema.CourseSchema);
            enrollmentModel = db.model(DataSchema.ENROLLMENTS, DataSchema.EnrollmentSchema);
            userModel = db.model(DataSchema.USERS, DataSchema.UserSchema);
            videoModel = db.model(DataSchema.VIDEOS, DataSchema.VideoSchema);
            logModel = db.model(DataSchema.LOGS, DataSchema.LogsSchema);
            denseLogModel = db.model(DataSchema.DENSELOGS, DataSchema.DenseLogsSchema);
            forumModel = db.model(DataSchema.FORUM, DataSchema.ForumSchema);
            socialNetworkModel = db.model(DataSchema.SOCIALNETWORK, DataSchema.SocialNetworkSchema);
            database = db;
        }
    });
}
const DatabaseManager = {
    get CacheDatabase() {
        return cacheDatabase;
    },
    get Database() {
        return database;
    },
    get CourseModel() {
        return courseModel;
    },
    get EnrollmentModel() {
        return enrollmentModel;
    },
    get UserModel() {
        return userModel;
    },
    get VideoModel() {
        return videoModel;
    },
    get LogModel() {
        return logModel;
    },
    get DenseLogModel() {
        return denseLogModel;
    },
    get ForumModel() {
        return forumModel;
    },
    get SocialNetworkModel() {
        return socialNetworkModel;
    },
    initMongo,
    initCacheDatabase,
    init,
};
exports.default = DatabaseManager;
var mongo_2 = require("./mongo");
exports.MONGO = mongo_2.MONGO;
// export { MYSQL } from "./mysql";
//# sourceMappingURL=databaseManager.js.map