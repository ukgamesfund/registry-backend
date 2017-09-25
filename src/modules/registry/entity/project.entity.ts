import {
	Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';

import {Membership} from "./membership.entity";
import {Resolution} from "./resolution.entity";

@Entity()
export class Project {
	constructor() {
	}

	@PrimaryColumn('int', {generated: true})
	id: number;

	@Column({name: 'address', nullable: true})
	address: string;

	@Column({name: 'name', nullable: true})
	name: string;

	@Column('json', {name: 'details', nullable: true})
	details: any;

	@OneToMany(type => Membership, membership => membership.project, {
		cascadeInsert: false,
		cascadeUpdate: false,
		lazy: false
	})
	memberships: Membership[];

	@OneToMany(type => Resolution, resolution => resolution.project, {
		cascadeInsert: false,
		cascadeUpdate: false,
		lazy: false
	})
	resolutions: Resolution[];

	@CreateDateColumn({nullable: true})
	created: Date;

	@UpdateDateColumn({nullable: true})
	updated: Date;
}