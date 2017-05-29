"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseDatabase {
    constructor(type, host, port, name) {
        this.type = type;
        this.host = host;
        this.port = port;
        this.name = name;
    }
    // protected type: string;
    get Type() {
        return this.type;
    }
    get Host() {
        return this.host;
    }
    get Port() {
        return this.port;
    }
    get Name() {
        return this.name;
    }
}
exports.BaseDatabase = BaseDatabase;
class BaseModel {
}
exports.BaseModel = BaseModel;
class BaseQuery {
}
exports.BaseQuery = BaseQuery;
//# sourceMappingURL=base.js.map