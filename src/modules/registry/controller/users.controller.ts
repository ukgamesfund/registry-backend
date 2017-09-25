import {Response} from 'express';
import {Controller, Get, Post, HttpStatus, Req, Res, Param, Body, Put, Delete} from '@nestjs/common';
import {UsersService} from "../service/users.service";
import {HttpException} from "@nestjs/core";
import {User} from "../entity/user.entity";
import {ConfirmationService} from "../service/confirmation.service";

@Controller()
export class UsersController {

	constructor(
		private usersService: UsersService,
		private confirmationService: ConfirmationService) {
	}

	@Post('api/user')
	public async add(@Req() req, @Res() res: Response, @Body('user') user) {
		console.log('post /user ' + JSON.stringify(user))

		if(req.jwt.address !== user.address) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

		const existing = await this.usersService.getByAddress(user.address)
		if (existing) {
			throw new HttpException("User already exists", HttpStatus.BAD_REQUEST);
		}

		let confirmation = await this.confirmationService.getByEmail(user.email);
		if(!confirmation) {
			throw new HttpException("User already exists", HttpStatus.BAD_REQUEST);
		}

		if(!confirmation.confirmed) {
			throw new HttpException("Email was not confirmed", HttpStatus.BAD_REQUEST);
		}

		const added = await this.usersService.add(user);
		res.status(HttpStatus.CREATED).json(added)
	}

	@Put('api/user')
	public async update(@Req() req, @Res() res: Response, @Body('user') user) {
		console.log('put /user ' + JSON.stringify(user))

		if(req.jwt.address !== user.address) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

		const existing = await this.usersService.getByAddress(user.address)
		if (!existing) {
			throw new HttpException(
				"User doesn't already exists already exists",
				HttpStatus.BAD_REQUEST
			);
		}

		if (existing.address != user.address) {
			throw new HttpException(
				"The provided address is not the same as the existing one",
				HttpStatus.BAD_REQUEST
			);
		}

		existing.email = user.email
		existing.details = user.details

		const added = await this.usersService.update(existing);
		res.status(HttpStatus.OK).json(added)
	}

	@Get('api/user/:address')
	public async getUser(@Req() req, @Res() res: Response, @Param('address') address) {
		console.log('get /user/' + address)

		if(req.jwt.address !== address) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

		let user = await this.usersService.getByAddress(address)
		if (!user) {
			user = new User()
		}
		res.status(HttpStatus.OK).json(user);
	}
}