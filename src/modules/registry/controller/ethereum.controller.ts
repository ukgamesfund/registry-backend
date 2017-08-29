import {Response} from 'express';
import {Controller, Get, HttpStatus, Req, Res} from '@nestjs/common';

import {EthereumService} from "../service/ethereum.service";


@Controller()
export class EthereumController {

	constructor(private ethereumService: EthereumService) {
		this.ethereumService.initialize();
	}

	@Get('api/ethereum/faucet')
	public async getFaucet(@Req() req, @Res() res: Response) {
		console.log("get /ethereum/faucet")

		let tx = await this.ethereumService.faucet(req.jwt.address);
		res.status(HttpStatus.OK).json({tx: tx});
	}

	@Get('api/ethereum/wallet')
	public async getWallet(@Req() req, @Res() res: Response) {
		console.log("get /ethereum/wallet");

		res.status(HttpStatus.OK).json({wallet: 'ee1a6d3c3725fe964bB5aCB29864584Ba8511a5B'});
	}
}