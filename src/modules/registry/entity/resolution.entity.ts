import {
	Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, OneToMany, ManyToOne, JoinColumn,
} from 'typeorm';
import {Project} from "./project.entity";
import {User} from "./user.entity";
import {Vote} from "./vote.entity";

@Entity()
export class Resolution {
	constructor() {
	}

	@PrimaryColumn('int', {generated: true})
	id: number;

	@ManyToOne(type => Project, project => project.resolutions, {
		cascadeInsert: false,
		cascadeUpdate: false,
		lazy: false
	})
	@JoinColumn({name: "project"})
	project: Project;

	@OneToMany(type => Vote, vote => vote.resolution, {
		cascadeInsert: false,
		cascadeUpdate: false,
		lazy: false
	})
	votes: Vote[];

	@Column('json', {name: 'details', nullable: true})
	details: any;

	@CreateDateColumn({nullable: true})
	created: Date;

	@UpdateDateColumn({nullable: true})
	updated: Date;
}