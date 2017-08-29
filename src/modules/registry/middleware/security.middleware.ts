import {Middleware, NestMiddleware} from '@nestjs/common';
import {HttpException} from '@nestjs/core';
import {Request, Response, NextFunction} from 'express';
let jwt = require('jsonwebtoken');

@Middleware()
export class SecurityMiddleware implements NestMiddleware {

	resolve() {
		return async function (req: Request, res: Response, next: NextFunction) {
			if (req.headers.authorization && (req.headers.authorization as string).split(' ')[0] === 'Bearer') {
				let token = (req.headers.authorization as string).split(' ')[1];
				const decoded: any = jwt.verify(token, process.env.JWT_SECRET);

				console.log(JSON.stringify(decoded));
				req.jwt = decoded;

				next();
			} else {
				throw new HttpException('unauthorised', 403);
			}
		};
	}
}