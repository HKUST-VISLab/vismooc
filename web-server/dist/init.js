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
const fs = require("fs");
const databaseManager_1 = require("./database/databaseManager");
exports.CONFIG = {
    port: 9999,
    subPath: '',
    mongo: {
        host: 'localhost',
        name: 'testVismoocElearning',
        port: 27017,
    },
    redis: {
        port: 6379,
        host: 'localhost',
    },
};
function initAll() {
    return __awaiter(this, void 0, void 0, function* () {
        const configFilePath = process.argv.slice(0)[2];
        if (configFilePath) {
            console.info('read config file from ' + configFilePath);
            const config = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
            exports.CONFIG = Object.assign({}, exports.CONFIG, config.webserver);
            exports.CONFIG.mongo = Object.assign({}, exports.CONFIG.mongo, config.mongo);
        }
        yield databaseManager_1.default.init();
        databaseManager_1.default.CacheDatabase.flushdb();
    });
}
exports.initAll = initAll;
//# sourceMappingURL=init.js.map