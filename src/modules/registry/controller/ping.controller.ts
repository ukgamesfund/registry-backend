import {Response} from 'express';
import {Controller, Get, Post, HttpStatus, Req, Res, Param, Body, Put, Delete} from '@nestjs/common';
import {UsersService} from "../service/users.service";

@Controller()
export class PingController {

	constructor(private usersService: UsersService) {
	}

	@Get('api/ping')
	public async ping(@Req() req, @Res() res: Response) {
		console.log('get /ping');
		res.status(HttpStatus.CREATED).json({message: 'pong'})
	}
}