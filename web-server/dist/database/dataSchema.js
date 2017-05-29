"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.COURSES = 'courses';
exports.CourseSchema = new mongoose_1.Schema({
    originalId: String,
    name: String,
    year: Number,
    org: String,
    courseImageUrl: String,
    instructor: [String],
    status: String,
    url: String,
    description: String,
    startDate: Number,
    endDate: Number,
    enrollmentStart: Number,
    enrollmentEnd: Number,
    studentIds: [String],
    videoIds: [String],
    grades: mongoose_1.Schema.Types.Mixed,
    metaInfo: String,
}, { collection: exports.COURSES });
exports.USERS = 'users';
exports.UserSchema = new mongoose_1.Schema({
    originalId: String,
    username: String,
    name: String,
    language: String,
    location: String,
    birthDate: Number,
    educationLevel: String,
    bio: String,
    gender: String,
    country: String,
    activeness: mongoose_1.Schema.Types.Mixed,
    courseRoles: mongoose_1.Schema.Types.Mixed,
    courseIds: [String],
    droppedCourseIds: [String],
}, { collection: exports.USERS });
exports.ENROLLMENTS = 'enrollments';
exports.EnrollmentSchema = new mongoose_1.Schema({
    userId: String,
    courseId: String,
    timestamp: Number,
    action: String,
}, { collection: exports.ENROLLMENTS });
exports.VIDEOS = 'videos';
exports.VideoSchema = new mongoose_1.Schema({
    originalId: String,
    name: String,
    temporalHotness: mongoose_1.Schema.Types.Mixed,
    section: String,
    description: String,
    releaseDate: Number,
    url: String,
    duration: Number,
    metaInfo: mongoose_1.Schema.Types.Mixed,
}, { collection: exports.VIDEOS });
exports.FORUM = 'forumthreads';
exports.ForumSchema = new mongoose_1.Schema({
    authorId: String,
    originalId: String,
    courseId: String,
    createdAt: Number,
    updatedAt: Number,
    body: String,
    sentiment: {
        type: Number,
        max: 1,
        min: -1,
    },
    type: {
        type: String,
        enum: ['CommentThread', 'Comment', null],
    },
    title: String,
    threadType: {
        type: String,
        enum: ['Question', 'Discussion', null],
    },
    commentThreadId: String,
    parentId: String,
}, { collection: exports.FORUM });
exports.SOCIALNETWORK = 'forumsocialnetworks';
exports.SocialNetworkSchema = new mongoose_1.Schema({
    courseId: String,
    socialNetwork: [mongoose_1.Schema.Types.Mixed],
    activeness: mongoose_1.Schema.Types.Mixed,
    activenessRange: [Number],
}, { collection: exports.SOCIALNETWORK });
exports.LOGS = 'logs';
exports.LogsSchema = new mongoose_1.Schema({
    metaInfo: mongoose_1.Schema.Types.Mixed,
    userId: String,
    videoId: String,
    courseId: String,
    timestamp: Number,
    type: String,
}, { collection: exports.LOGS });
exports.DENSELOGS = 'denselogs';
exports.DenseLogsSchema = new mongoose_1.Schema({
    videoId: String,
    courseId: String,
    timestamp: Number,
    clicks: [mongoose_1.Schema.Types.Mixed],
}, { collection: exports.DENSELOGS });
exports.METADBFILES = 'metadbfiles';
exports.MetadbFilesSchema = new mongoose_1.Schema({
    createdAt: Number,
    lastModified: Number,
    processed: Boolean,
    etag: String,
    path: String,
    type: String,
}, { collection: exports.METADBFILES });
exports.default = {
    // course
    COURSES: exports.COURSES,
    CourseSchema: exports.CourseSchema,
    // user
    USERS: exports.USERS,
    UserSchema: exports.UserSchema,
    // enrollment
    ENROLLMENTS: exports.ENROLLMENTS,
    EnrollmentSchema: exports.EnrollmentSchema,
    // video
    VIDEOS: exports.VIDEOS,
    VideoSchema: exports.VideoSchema,
    // logs
    LOGS: exports.LOGS,
    LogsSchema: exports.LogsSchema,
    // denselogs
    DENSELOGS: exports.DENSELOGS,
    DenseLogsSchema: exports.DenseLogsSchema,
    // forum
    FORUM: exports.FORUM,
    ForumSchema: exports.ForumSchema,
    // socialnetwork
    SOCIALNETWORK: exports.SOCIALNETWORK,
    SocialNetworkSchema: exports.SocialNetworkSchema,
    // metadbfiles
    METADBFILES: exports.METADBFILES,
    MetadbFilesSchema: exports.MetadbFilesSchema,
};
//# sourceMappingURL=dataSchema.js.map