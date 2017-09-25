import {Component} from '@nestjs/common';

import Semaphore from 'semaphore-async-await';
import {Utils} from "../../../providers/utility-service";

let Es6Promisify = require('es6-promisify');
let EthLightWallet = require('eth-lightwallet');
let PromisifyWeb3 = require('../../../utils/promisifyWeb3.js');
let Web3 = require('web3');
let HookedWeb3Provider = require('hooked-web3-provider');
let Transaction = require("ethereumjs-tx");

let FaucetWallet = require('../../../configuration/faucet.json');

@Component()
export class EthereumService {

	private ks: any
	private pdk: string;
	private web3: any
	private lock = new Semaphore(1);
	private initialised: Boolean = false;
	private address: string;
	private rpc: string = process.env.WEB3_RPC;

	constructor() {
		this.promisify();
	}

	public async initialize() {
		await this.lock.acquire();

		this.pdk = await EthLightWallet.keystore.deriveKeyFromPassword(process.env.FAUCET_PASSWORD);

		this.ks = EthLightWallet.keystore.deserialize(JSON.stringify(FaucetWallet));
		this.ks.passwordProvider = (cb) => {cb(null, process.env.FAUCET_PASSWORD);};
		this.address = Utils.add0x(this.ks.getAddresses()[0]);

		this.web3 = new Web3(this.getHookedWeb3Provider())
		PromisifyWeb3.promisify(this.web3);

		this.initialised = true;
		await this.lock.release();
	}

	private promisify() {
		EthLightWallet.keystore.deriveKeyFromPassword = Es6Promisify(EthLightWallet.keystore.deriveKeyFromPassword);
		EthLightWallet.keystore.createVault = Es6Promisify(EthLightWallet.keystore.createVault);
	}

	public async faucet(address: string) {
		let tx = await this.web3.eth.sendTransactionPromise({
			from: this.address,
			value: this.etherToWei(1),
			to: Utils.add0x(address)
		});
		return tx;
	}

	// ---------------------------------------------------------------------------------------------------

	private privateKey(): Buffer {
		let key = this.ks.exportPrivateKey(this.address, this.pdk)
		return new Buffer(key, 'hex');
	}

	private getHookedWeb3Provider() {
		let provider = new HookedWeb3Provider({
			host: this.rpc,
			transaction_signer: {
				hasAddress: (address, callback) => {
					callback(null, address === Utils.add0x(this.address))
				},
				signTransaction: (params, callback) => {
					this.sign(params, callback)
				}
			}
		});
		return provider;
	}

	private async sign(params, callback) {
		console.log("sign()")
		let tx = {};

		let gasPrice = await this.web3.eth.getGasPricePromise()
		let nonce = await this.web3.eth.getTransactionCountPromise(params['from'], 'pending')

		tx['from'] = Utils.add0x(params.from)
		tx['to'] = Utils.add0x(params.to)
		tx['data'] = Utils.add0x(params.data)

		tx['gasPrice'] = parseInt(gasPrice)
		tx['nonce'] = parseInt(nonce)

		let gasLimit = '1000000';

		if (params['value'] != undefined) {
			tx['value'] = params['value'];
		}

		tx['gasLimit'] = parseInt(gasLimit)
		tx['gas'] = parseInt(gasLimit)

		console.log(JSON.stringify(tx))

		let transaction = new Transaction(tx)
		let key = this.privateKey()

		transaction.sign(key)
		let signed = transaction.serialize().toString('hex')

		console.log("signed: " + signed)
		callback(null, '0x' + signed)
	}

	public async getBalance(): Promise<number> {
		let number = await this.web3.eth.getBalancePromise(this.address);
		return this.web3.fromWei(number, 'ether');
	}

	private etherToWei(ether: number) {
		let wei = this.web3.toWei(ether.toString(), "ether");
		return wei;
	}

}