import {UserEx} from '../entity/user-ex.entity';
import {Service} from './service.interface';
import {DatabaseService} from '../database/database.service';
import {Repository} from 'typeorm';
import {Component} from '@nestjs/common';

@Component()
export class UsersExService implements Service<UserEx> {

	constructor(private databaseService: DatabaseService) {
	}

	private get repository(): Promise<Repository<UserEx>> {
		return this.databaseService.getRepository(UserEx);
	}

	public async add(userEx: UserEx): Promise<UserEx> {
		return (await this.repository).persist(userEx);
	}

	public async addAll(userExs: UserEx[]): Promise<UserEx[]> {
		return (await this.repository).persist(userExs);
	}

	public async get(id: number): Promise<UserEx> {
		return (await this.repository).findOneById(id);
	}

	public async getAll(): Promise<UserEx[]> {
		return (await this.repository).find();
	}

	public async getByAddress(address: string): Promise<UserEx> {
		return (await this.repository).findOne({address: address})
	}

	public async update(userEx: UserEx): Promise<UserEx> {
		return (await this.repository).persist(userEx);
	}

	public async remove(userEx: UserEx): Promise<UserEx> {
		return (await this.repository).remove(userEx);
	}
}