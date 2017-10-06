import {Component} from '@nestjs/common';
import {User} from '../entity/user.entity';
import {Service} from './service.interface';
import {DatabaseService} from '../database/database.service';
import {Repository} from 'typeorm';

@Component()
export class UsersService implements Service<User> {

	constructor(private databaseService: DatabaseService) {
		this.seed()
	}

	private async seed() {
		const photosRepository = await this.repository;
		let count = await photosRepository.count();
		if (count == 0) {
			console.log('Database is now empty.');
		}
	}

	private get repository(): Promise<Repository<User>> {
		return this.databaseService.getRepository(User);
	}

	public async add(user: User): Promise<User> {
		return (await this.repository).persist(user);
	}

	public async addAll(users: User[]): Promise<User[]> {
		return (await this.repository).persist(users);
	}

	public async getAll(): Promise<User[]> {
		return (await this.repository).find();
	}

	public async get(id: number): Promise<User> {
		return (await this.repository).findOneById(id);
	}

	public async getByEmail(email: string): Promise<User> {
		return (await this.repository).findOne({email: email})
	}

	public async getByAddress(address: string): Promise<User> {
		return (await this.repository)
			.createQueryBuilder("user")
			.innerJoinAndSelect("user.userEx", "userex")
			.where("userex.address=address")
			.getOne();
	}

	public async update(user: User): Promise<User> {
		return (await this.repository).persist(user);
	}

	public async remove(user: User): Promise<User> {
		return (await this.repository).remove(user);
	}
}