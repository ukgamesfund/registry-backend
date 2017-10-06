import {
	Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne,
} from 'typeorm';

import {User} from "./user.entity";
import {Project} from "./project.entity";

export enum Role {
	ProjectInitiator = 0,
	CreativeFounder = 1
}

@Entity()
export class Membership {
	constructor() {
	}

	@PrimaryColumn('int', {generated: true})
	id: number;

	@Column({name: 'role', nullable: false})
	role: Role;

	@Column({name: 'silvertals', nullable: true})
	silverTals: number;

	@Column({name: 'coppertals', nullable: true})
	copperTals: number;

	@ManyToOne(type => User, user => user.memberships, {
		cascadeInsert: false,
		cascadeUpdate: false,
		lazy: false
	})
	@JoinColumn({name: "user"})
	user: User;

	@ManyToOne(type => Project, project => project.memberships, {
		cascadeInsert: false,
		cascadeUpdate: false,
		lazy: false
	})
	@JoinColumn({name: "project"})
	project: Project;

	@CreateDateColumn({nullable: true})
	created: Date;

	@UpdateDateColumn({nullable: true})
	updated: Date;
}