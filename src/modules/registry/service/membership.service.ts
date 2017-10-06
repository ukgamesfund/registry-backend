import {Service} from './service.interface';
import {DatabaseService} from '../database/database.service';
import {Repository} from 'typeorm';
import {Component} from '@nestjs/common';
import {Membership, Role} from "../entity/membership.entity";

@Component()
export class MembershipService implements Service<Membership> {

	constructor(private databaseService: DatabaseService) {
	}

	private get repository(): Promise<Repository<Membership>> {
		return this.databaseService.getRepository(Membership);
	}

	public async add(membership: Membership): Promise<Membership> {
		return (await this.repository).persist(membership);
	}

	public async addAll(membership: Membership[]): Promise<Membership[]> {
		return (await this.repository).persist(membership);
	}

	public async get(id: number): Promise<Membership> {
		return (await this.repository).findOneById(id);
	}

	// todo: fix this and add search criteria
	public async getAllByProjectAddress(address: string, role: Role): Promise<Membership[]> {
		return (await this.repository)
			.createQueryBuilder("membership")
			.innerJoinAndSelect("membership.project", "project")
			.where("project.address=address")
			.andWhere("membership.role=role")
			.getMany();
	}

	public async getAll(): Promise<Membership[]> {
		return (await this.repository).find();
	}

	public async update(membership: Membership): Promise<Membership> {
		return (await this.repository).persist(membership);
	}

	public async remove(membership: Membership): Promise<Membership> {
		return (await this.repository).remove(membership);
	}
}