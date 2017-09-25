import {Component} from '@nestjs/common';
import {DatabaseService} from '../database/database.service';
import {Repository} from 'typeorm';
import {Confirmation} from "../entity/confirmation.entity";

@Component()
export class ConfirmationService {

	constructor(private databaseService: DatabaseService) {
	}

	private get repository(): Promise<Repository<Confirmation>> {
		return this.databaseService.getRepository(Confirmation);
	}

	public async add(confirmation: Confirmation): Promise<Confirmation> {
		return (await this.repository).persist(confirmation);
	}

	public async getByEmail(email: string): Promise<Confirmation> {
		email = email.toLowerCase();
		return (await this.repository).findOne({email: email})
	}

	public async update(confirmation: Confirmation): Promise<Confirmation> {
		return (await this.repository).persist(confirmation);
	}

	public async remove(confirmation: Confirmation): Promise<Confirmation> {
		return (await this.repository).remove(confirmation);
	}

}