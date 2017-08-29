import {
	Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, OneToMany,
} from 'typeorm';
import {Membership} from "./membership.entity";
import {Vote} from "./vote.entity";


@Entity()
export class User {
	constructor() {
	}

	@PrimaryColumn('int', {generated: true})
	id: number;

	@Column({name: 'address', nullable: false, unique: true})
	address: string;

	@Column({name: 'email', nullable: true})
	email: string;

	@Column('json', {name: 'details', nullable: true})
	details: any;

	@OneToMany(type => Membership, membership => membership.user, {
		cascadeInsert: false,
		cascadeUpdate: false,
		lazy: false
	})
	memberships: Membership[];

	@OneToMany(type => Vote, vote => vote.user, {
		cascadeInsert: false,
		cascadeUpdate: false,
		lazy: false
	})
	votes: Vote[];

	@CreateDateColumn({nullable: true})
	created: Date;

	@UpdateDateColumn({nullable: true})
	updated: Date;
}