import {NestFactory} from '@nestjs/core';
import {ApplicationModule} from './modules/application/application.module';

// import reflect for TypeORM
import 'reflect-metadata';

// middleware imports
import express = require('express');
import cors = require('cors');
import * as BodyParser from 'body-parser';
import * as ExpressSession from 'express-session';
import {Config} from "./providers/config-service";


let sessionConfig = {
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: true,
	proxy: true,
	cookie: {
		secure: false,
		maxAge: 60000, // one minute
		path: '/api/jwt'
	}
}

let corsOptions = {
	origin: Config.ORIGIN_HOST,
	credentials: true
}

// configure middleware on express instance
const engine = express();
engine.use(BodyParser.json({limit: '50mb'}));
engine.use(BodyParser.urlencoded({limit: '50mb', extended: true}));

//engine.options('*', cors(corsOptions)) // include before other routes
engine.use(cors(corsOptions));

if (engine.get('env') === 'production') {
	engine.set('trust proxy', 1) // trust first proxy
	sessionConfig.cookie.secure = true // serve secure cookies
}

engine.use(ExpressSession(sessionConfig));

let app = NestFactory.create(ApplicationModule, engine)
app.listen(
	Number.parseInt(process.env.PORT),
	() => {console.log(`Application is listening on port ${process.env.PORT}.`);}
);
