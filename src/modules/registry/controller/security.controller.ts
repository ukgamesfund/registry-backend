import {Request, Response} from 'express';
import {Controller, Get, Post, HttpStatus, Req, Res, Param, Body, Put} from '@nestjs/common';

import {HttpException} from '@nestjs/core';
import {ConfirmationService} from '../service/confirmation.service';
import {EmailService} from '../service/email.service';

let Random = require('random-js');
let EthUtil = require('ethereumjs-util');
let jwt = require('jsonwebtoken');
import * as EmailValidator from 'email-validator';

import {Confirmation} from '../entity/confirmation.entity';


export interface IJwtOptions {
	algorithm: string;
	expiresIn: number | string;
	jwtid: string;
}

@Controller()
export class SecurityController {

	private random: any;

	private options: IJwtOptions = {
		algorithm: 'HS256',
		expiresIn: '1 days',
		jwtid: process.env.JWT_ID
	};

	constructor(
		private confirmationService: ConfirmationService,
		private emailService: EmailService,) {
		this.random = new Random(Random.engines.nativeMath);
	}

	@Get('api/jwt/:address')
	public async getNonce(
			@Req() req: Request,
			@Res() res: Response,
			@Param('address') address: string) {

		console.log('get /jwt/' + address)

		req.session.code = this.random.hex(64)
		res.status(HttpStatus.OK).json({code: req.session.code});
	}

	@Post('api/jwt/:address')
	public async postJwt(
			@Req() req,
			@Res() res: Response,
			@Body('payload') payload,
			@Param('address') address: string) {

		console.log('post /jwt/' + address + ' payload: ' + JSON.stringify(payload))

		let code = req.session.code;
		if (!code) {
			throw new HttpException('No random code in current session', 500);
		}

		let sig = EthUtil.fromRpcSig(EthUtil.addHexPrefix(payload.signature));
		let message = EthUtil.toBuffer(code + payload.nonce);
		let hash = EthUtil.sha3(message);

		let pk = EthUtil.ecrecover(hash, sig.v, sig.r, sig.s);
		let recovered = EthUtil.publicToAddress(pk);

		if (address !== recovered.toString('hex')) {
			throw new HttpException('Invalid signature', 403);
		}

		const jwtPayload = {
			address: address,
		};

		let token = await jwt.sign(jwtPayload, process.env.JWT_SECRET, this.options);

		req.session.destroy( (err) => {
			res.status(HttpStatus.OK).json({jwt: token});
		})
	}

	@Put('api/jwt/test')
	public async getTest(
			@Req() req: Request,
			@Res() res: Response) {

		console.log('get /jwt/test');
		res.status(HttpStatus.OK).json({jwt: req.session.jwt});
	}

	@Post('api/email/code')
	public async postEmailCode(
		@Req() req,
		@Res() res: Response,
		@Body('email') email) {

		console.log('post /api/email/code: '+email);

		if (!EmailValidator.validate(email)) {
			throw new HttpException('Invalid email', HttpStatus.BAD_REQUEST);
		}

		email = email.toLowerCase();
		let confirmation = await this.confirmationService.getByEmail(email);
		if(confirmation) {
			if(confirmation.retries > 5) {
				throw new HttpException('Too many retries', HttpStatus.BAD_REQUEST);
			}
			confirmation.retries += 1;
		} else {
			confirmation = new Confirmation();
			confirmation.email = email;
			confirmation.retries = 0;
		}

		confirmation.code = this.random.integer(100000, 999999);
		let saved = await this.confirmationService.update(confirmation);
		console.log(JSON.stringify(saved));

		let text = 'Your email confirmation code is: '+confirmation.code;
		let html = 'Your email confirmation code is: <strong>'+confirmation.code+'</strong>';

		await this.emailService.send(
			email,
			'TalRegistry email confirmation code',
			text,
			html
		);
		res.status(HttpStatus.OK).json({message: 'email sent'});
	}

	@Post('api/email/confirm')
	public async postEmailConfirm(
		@Req() req,
		@Res() res: Response,
		@Body('payload') payload) {

		if (!EmailValidator.validate(payload.email)) {
			throw new HttpException('Invalid email', HttpStatus.BAD_REQUEST);
		}

		let confirmation = await this.confirmationService.getByEmail(payload.email);
		if(!confirmation) {
			throw new HttpException('Email code was not requested', HttpStatus.BAD_REQUEST);
		}
		
		if(confirmation.retries > 5) {
			throw new HttpException('Too many retries', HttpStatus.BAD_REQUEST);
		}

		if(confirmation.confirmed == true) {
			throw new HttpException('Email already confirmed', HttpStatus.BAD_REQUEST);
		}
		
		if(payload.code === confirmation.code) {
			confirmation.confirmed = true;
		} else {
			throw new HttpException('Invalid confirmation code', HttpStatus.BAD_REQUEST);
		}
		
		confirmation.retries += 1;
		confirmation = await this.confirmationService.update(confirmation);
		console.log(JSON.stringify(confirmation));
		res.status(HttpStatus.OK).json({message: 'success'});
	}
}