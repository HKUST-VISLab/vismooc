"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kcors = require("kcors");
const Koa = require("koa");
const koa_bodyparser_ts_1 = require("koa-bodyparser-ts");
const staticFile = require("koa-static");
const controllers_1 = require("./controllers");
const databaseManager_1 = require("./database/databaseManager");
const hackPermission_1 = require("./middlewares/hackPermission");
const logging_1 = require("./middlewares/logging");
const passport_1 = require("./middlewares/passport");
const permission_1 = require("./middlewares/permission");
const session_1 = require("./middlewares/session");
const getCourse_1 = require("./routes/getCourse");
const getForum_1 = require("./routes/getForum");
const getVideo_1 = require("./routes/getVideo");
const verify_1 = require("./routes/verify");
function Server() {
    const app = new Koa();
    // data controller
    app.context.dataController = new controllers_1.DataController(databaseManager_1.default.Database);
    // middlewares
    app.use(kcors());
    app.use(logging_1.default('combined'));
    app.use(koa_bodyparser_ts_1.default());
    app.use(staticFile('./public/'));
    app.keys = ['secret'];
    app.use(session_1.default());
    const passport = new passport_1.Passport(app.context);
    passport.deserializeUser((user, ctx) => {
        // console.log("deserializeUser", id);
        return user;
    });
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(permission_1.default());
    app.use(hackPermission_1.default());
    app.use(verify_1.default.routes());
    app.use(getCourse_1.default.routes());
    app.use(getVideo_1.default.routes());
    app.use(getForum_1.default.routes());
    return app;
}
exports.default = Server;
//# sourceMappingURL=server.js.map