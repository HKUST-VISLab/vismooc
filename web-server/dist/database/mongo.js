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
const base_1 = require("./base");
exports.MONGO = 'MONGO';
class MongoDatabase extends base_1.BaseDatabase {
    constructor(host = 'localhost', port = 27017, name = 'vismooc') {
        super(exports.MONGO, host, port, name);
    }
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            this.db = yield mongoose.createConnection(this.host, this.name, this.port);
        });
    }
    model(name, schema) {
        // TODO improve here
        if (!this.db) {
            throw new Error('you should fristly open the database');
        }
        // console.log(schema);
        const model = this.db.model(name, schema);
        return new MongoModel(model);
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.db) {
                yield this.db.close();
                this.db = undefined;
            }
        });
    }
}
exports.MongoDatabase = MongoDatabase;
class MongoModel extends base_1.BaseModel {
    constructor(model) {
        super();
        this.model = model;
    }
    where(path, val) {
        return new MongoQuery(this.model.where(path, val));
    }
    all() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.model.find().lean());
        });
    }
}
exports.MongoModel = MongoModel;
class MongoQuery extends base_1.BaseQuery {
    constructor(query) {
        super();
        this.query = query;
        this.field = '';
    }
    equals(val) {
        this.query = this.query.equals(val);
        return this;
    }
    gt(val) {
        this.query = this.query.gt(val);
        return this;
    }
    gte(val) {
        this.query = this.query.gte(val);
        return this;
    }
    in(val) {
        this.query = this.query.in(val);
        return this;
    }
    lt(val) {
        this.query = this.query.lt(val);
        return this;
    }
    lte(val) {
        this.query = this.query.lte(val);
        return this;
    }
    ne(val) {
        this.query = this.query.ne(val);
        return this;
    }
    nin(val) {
        this.query = this.query.nin(val);
        return this;
    }
    exists(val) {
        this.query = this.query.exists(val);
        return this;
    }
    select(arg) {
        this.field = arg;
        this.query = this.query.select(arg);
        return this;
    }
    where(path, val) {
        this.query = this.query.where(path, val);
        return this;
    }
    count() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.query.count();
        });
    }
    /* Executes the query */
    exec() {
        return __awaiter(this, void 0, void 0, function* () {
            /*
            this.query = this.query.lean();
            const model = (this.query as any).model;
            const query = this.query.getQuery();
            const options = (this.query as any)._optionsForExec(model);
            const fields = Object.assign({}, (self as any)._fields, this.field);
            const schemaOptions = model.schema.options;
            const expires = schemaOptions.expires || 86400;
            const redis = DatabaseManager.CacheDatabase;
            if (options.lean) {
                return mongoose.Query.prototype.exec.apply(self, arguments);
            }
            const key = JSON.stringify(query) + JSON.stringify(options) + JSON.stringify(fields);
            const result: string = (await redis.get(key)) as string;
            let docs;
            if (!result) {
                docs = await self.exec();
                const str = JSON.stringify(docs);
                redis.set(key, str);
                redis.expire(key, expires);
            } else {
                docs = JSON.parse(result);
                redis.expire(key, expires);
            }
            return docs as T[];*/
            return (yield this.query.lean().exec());
        });
    }
}
exports.MongoQuery = MongoQuery;
//# sourceMappingURL=mongo.js.map