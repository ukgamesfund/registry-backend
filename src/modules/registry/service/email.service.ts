import {Component} from '@nestjs/common';

let sg = require('@sendgrid/mail');

@Component()
export class EmailService  {

	constructor() {
		sg.setApiKey(process.env.SENDGRID_API_KEY);
	}

	public async send(to: string, subject: string, text: string, html: string = null) {

		const msg = {
			to: to,
			from: 'noreply@talregistry.com',
			subject: subject,
			text: text,
			html: html,
		};
		await sg.send(msg);
	}
}