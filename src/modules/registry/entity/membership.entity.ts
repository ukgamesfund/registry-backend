import {
	Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne,
} from 'typeorm';

import {User} from "./user.entity";
import {Project} from "./project.entity";


@Entity()
export class Membership {
	constructor() {
	}

	@PrimaryColumn('int', {generated: true})
	id: number;

	@Column({name: 'role', nullable: true})
	role: string;

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