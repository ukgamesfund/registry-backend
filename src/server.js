"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const application_module_1 = require("./modules/application/application.module");
require("reflect-metadata");
const express = require("express");
const cors = require("cors");
const BodyParser = require("body-parser");
const ExpressSession = require("express-session");
const config_service_1 = require("./providers/config-service");
let sessionConfig = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    proxy: true,
    cookie: {
        secure: false,
        maxAge: 60000,
        path: '/api/jwt'
    }
};
let corsOptions = {
    origin: config_service_1.Config.ORIGIN_HOST,
    credentials: true
};
const engine = express();
engine.use(BodyParser.json({ limit: '50mb' }));
engine.use(BodyParser.urlencoded({ limit: '50mb', extended: true }));
engine.use(cors(corsOptions));
if (engine.get('env') === 'production') {
    engine.set('trust proxy', 1);
    sessionConfig.cookie.secure = true;
}
engine.use(ExpressSession(sessionConfig));
let app = core_1.NestFactory.create(application_module_1.ApplicationModule, engine);
app.listen(Number.parseInt(process.env.PORT), () => { console.log(`Application is listening on port ${process.env.PORT}.`); });
//# sourceMappingURL=server.js.map