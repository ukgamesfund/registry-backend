import {
	Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';

import {Membership} from "./membership.entity";
import {Resolution} from "./resolution.entity";

export enum State {
	Initiating = 0,
	AwaitingConfirmation = 1,
	Confirmed = 2,
	Rejected = 3
}

@Entity()
export class Project {
	constructor() {
	}

	@PrimaryColumn('int', {generated: true})
	id: number;

	@Column({name: 'address', nullable: false, unique:true})
	address: string;

	@Column({name: 'name', nullable: false, unique: true})
	name: string;

	@Column({name: 'email', nullable: false})
	email: string;

	@Column({name:'state', nullable: false})
	state: State;

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