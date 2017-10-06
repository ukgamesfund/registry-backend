import {
	Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, JoinColumn,
} from 'typeorm';
import {Membership} from "./membership.entity";
import {Vote} from "./vote.entity";
import {UserEx} from "./user-ex.entity";

@Entity()
export class User {
	constructor() {
	}

	@PrimaryColumn('int', {generated: true})
	id: number;

	@OneToOne(type => UserEx)
	@JoinColumn()
	userEx: UserEx;

	@Column({name: 'email', nullable: false, unique: true})
	email: string;

	@Column({name: 'name', nullable: true})
	name: string;

	@Column({name: 'mobile', nullable: true})
	mobile: string;

	@Column('json', {name: 'details', nullable: true})
	details: any;

	@Column({name: 'confirmed', nullable: false, default: false})
	isAdmin: boolean;

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