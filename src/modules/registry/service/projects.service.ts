import {Project} from '../entity/project.entity';
import {Service} from './service.interface';
import {DatabaseService} from '../database/database.service';
import {Repository} from 'typeorm';
import {Component} from '@nestjs/common';

@Component()
export class ProjectsService implements Service<Project> {

    constructor(private databaseService: DatabaseService) {
    }

    private get repository(): Promise<Repository<Project>> {
        return this.databaseService.getRepository(Project);
    }

	public async add(projects: Project): Promise<Project> {
		return (await this.repository).persist(projects);
	}

	public async addAll(projects: Project[]): Promise<Project[]> {
		return (await this.repository).persist(projects);
	}

	public async getAll(): Promise<Project[]> {
		return (await this.repository).find();
	}

	public async get(id: number): Promise<Project> {
		return (await this.repository).findOneById(id);
	}

	public async getByName(name: string): Promise<Project> {
		return (await this.repository).findOne({name: name});
	}

	public async getByAddress(address: string): Promise<Project> {
		return (await this.repository).findOne({address: address});
	}

	public async update(project: Project): Promise<Project> {
		return (await this.repository).persist(project);
	}

	public async remove(project: Project): Promise<Project> {
		return (await this.repository).remove(project);
	}
}