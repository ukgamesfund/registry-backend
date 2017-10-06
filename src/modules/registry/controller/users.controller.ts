import {Response} from 'express';
import {Controller, Get, Post, HttpStatus, Req, Res, Param, Body, Put, Delete} from '@nestjs/common';
import {UsersService} from "../service/users.service";
import {HttpException} from "@nestjs/core";
import {User} from "../entity/user.entity";
import {ConfirmationService} from "../service/confirmation.service";
import {UserEx} from "../entity/user-ex.entity";
import {CreateUserDto} from "../dto/create-user.dto";
import {UsersExService} from "../service/user-ex.service";

@Controller()
export class UsersController {

	constructor(
		private usersService: UsersService,
		private confirmationService: ConfirmationService,
		private userExService: UsersExService) {
	}

	@Post('api/user')
	public async add(@Req() req,
	                 @Res() res: Response,
	                 @Body() createUserDto: CreateUserDto) {

		console.log('Adding a new user ' + JSON.stringify(createUserDto))

		if(req.jwt.address !== createUserDto.address)
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

		let existing = await this.usersService.getByAddress(createUserDto.address);
		if (existing) {
			throw new HttpException("User already exists, use update user", HttpStatus.BAD_REQUEST);
		}

		existing = await this.usersService.getByEmail(createUserDto.email);
		if (existing) {
			throw new HttpException("User already exists, use update user", HttpStatus.BAD_REQUEST);
		}

		let confirmation = await this.confirmationService.getByEmail(createUserDto.email);
		if(!confirmation) {
			throw new HttpException("Email was not sent", HttpStatus.BAD_REQUEST);
		}

		if(!confirmation.confirmed) {
			throw new HttpException("Email was not confirmed", HttpStatus.BAD_REQUEST);
		}

		// create and persist UserEx
		let newUserEx: UserEx = new UserEx();
		newUserEx.address = createUserDto.address;
		let addedUserEx = await this.userExService.add(newUserEx);
		if(addedUserEx)
			throw new HttpException('Could not create the user', HttpStatus.EXPECTATION_FAILED);

		// create and persist User
		let newUser: User = new User();
		newUser.name = createUserDto.name;
		newUser.email = createUserDto.email;
		newUser.mobile = createUserDto.mobile;
		newUser.details = createUserDto.details;
		newUser.userEx = newUserEx;
		let addedUser = await this.usersService.add(newUser);
		if(!addedUser)
			throw new HttpException('Could not update the address', HttpStatus.EXPECTATION_FAILED);

		console.log('Added user ' + JSON.stringify(addedUser));

		res.status(HttpStatus.CREATED).json(addedUser)
	}

	// allows to update an existing user either by email or by address
	@Put('api/user')
	public async update(@Req() req,
	                    @Res() res: Response,
	                    @Body() createUserDto: CreateUserDto) {

		console.log('Updating existing user ' + JSON.stringify(createUserDto))

		if(req.jwt.address !== createUserDto.address)
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

		// try finding the user by address
		let existingUser = await this.usersService.getByAddress(createUserDto.address);
		if (!existingUser) {
			// it could be a user stub created via project invitation
			// so, let's try and find it by email instead
			existingUser = await this.usersService.getByEmail(createUserDto.email);
			if (!existingUser) {
				// really no such user
				throw new HttpException("No such user", HttpStatus.BAD_REQUEST);
			}

			// we got it, let's set the address (if required) for this user
			// prevent the unset address operation
			if (createUserDto.address) {
				let newUserEx: UserEx = new UserEx();
				newUserEx.address = createUserDto.address;
				let addedUserEx = await this.userExService.add(newUserEx);
				if(!addedUserEx)
					throw new HttpException('Could not set user address', HttpStatus.EXPECTATION_FAILED);

				// tie the existing user to the userEx
				// todo: check if the assignment is performed by value, this line is prone to dangling reference
				existingUser.userEx = addedUserEx;
			}
		}

		existingUser.name = createUserDto.name;
		existingUser.mobile = createUserDto.mobile;
		existingUser.email = createUserDto.email;
		existingUser.details = createUserDto.details;

		let updatedUser = await this.usersService.update(existingUser);
		if(!updatedUser)
			throw new HttpException('Could not update the user', HttpStatus.EXPECTATION_FAILED);
		
		res.status(HttpStatus.OK).json(updatedUser);
	}

	@Get('api/user/:address')
	public async getByAddress(@Req() req,
	                          @Res() res: Response,
	                          @Param('address') address) {

		console.log('Getting user by address' + address);

		if(req.jwt.address !== address)
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

		let existingUser = await this.usersService.getByAddress(address);
		if (!existingUser) {
			existingUser = new User()
		}

		console.log('Got user ' + JSON.stringify(existingUser));

		res.status(HttpStatus.OK).json(existingUser);
	}

	@Get('api/user/:email')
	public async getByEmail(@Req() req,
	                        @Res() res: Response,
	                        @Param('email') email) {

		console.log('Getting user by address' + email);

		if(req.jwt.address !== email)
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

		let existingUser = await this.usersService.getByEmail(email);
		if (!existingUser)
			throw new HttpException('No such user', HttpStatus.EXPECTATION_FAILED);
		
		console.log('Got user ' + JSON.stringify(existingUser));

		res.status(HttpStatus.OK).json(existingUser);
	}
}