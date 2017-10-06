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

	public async emailConfirmationCode(to: string, code: string){
		let subject = 'TalRegistry confirmation code';
		let text = 'Someone, hopefully you, registered to TalRegistry. Your confirmation code is: '+ code;
		let html = 'Someone, hopefully you, registered to TalRegistry. Your confirmation code is: <strong>'+ code +'</strong>';

		this.send(to, subject, text, html);
	}
	public async emailProjectInvitation(to: string, project: string) {

		//todo: set the url
		//todo: maybe add these from some property file, even from the database

		let url = '<url>'; //todo: set url
		let subject = 'Welcome to ' + project + 'project';
		let text = 'Hi, you have been invited to the project ' + project + '. Follow the url below to join: ' + url;
		let html = 'Hi, you have been invited to the project <strong>' + project + '</strong>. Follow the url below to join: ' + url;

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