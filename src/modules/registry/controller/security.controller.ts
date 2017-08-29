import {Request, Response} from 'express';
import {Controller, Get, Post, HttpStatus, Req, Res, Param, Body, Put} from '@nestjs/common';

import {HttpException} from "@nestjs/core";

let Random = require('random-js');
let EthUtil = require('ethereumjs-util');
let jwt = require('jsonwebtoken');


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

	constructor() {
		this.random = new Random(Random.engines.nativeMath);
	}

	@Get('api/jwt/:address')
	public async getNonce(
			@Req() req: Request,
			@Res() res: Response,
			@Param('address') address: string) {

		console.log("get /jwt/" + address)

		req.session.code = this.random.hex(64)
		res.status(HttpStatus.OK).json({code: req.session.code});
	}

	@Post('api/jwt/:address')
	public async postJwt(
			@Req() req,
			@Res() res: Response,
			@Body('payload') payload,
			@Param('address') address: string) {

		console.log("post /jwt/" + address + " payload: " + JSON.stringify(payload))

		let code = req.session.code;
		if (!code) {
			throw new HttpException("No random code in current session", 500);
		}

		let sig = EthUtil.fromRpcSig(EthUtil.addHexPrefix(payload.signature));
		let message = EthUtil.toBuffer(code + payload.nonce);
		let hash = EthUtil.sha3(message);

		let pk = EthUtil.ecrecover(hash, sig.v, sig.r, sig.s);
		let recovered = EthUtil.publicToAddress(pk);

		if (address !== recovered.toString('hex')) {
			throw new HttpException("Invalid signature", 403);
		}

		const jwtPayload = {
			address: address,
		};

		let token = await jwt.sign(jwtPayload, process.env.JWT_SECRET, this.options);

		req.session.destroy( (err) => {
			res.status(HttpStatus.OK).json({jwt: token});
		})
	}

	@Put('jwt/test')
	public async getTest(
			@Req() req: Request,
			@Res() res: Response) {

		console.log("get /jwt/test")
		res.status(HttpStatus.OK).json({jwt: req.session.jwt});
	}


}