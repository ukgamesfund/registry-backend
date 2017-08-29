import {
	Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, OneToMany, OneToOne, ManyToOne,
	JoinColumn,
} from 'typeorm';

import {User} from "./user.entity";
import {Resolution} from "./resolution.entity";

import {VoteType} from "../../../providers/utility-service"

@Entity()
export class Vote {
	constructor() {
	}

	@PrimaryColumn('int', {generated: true})
	id: number;

	@ManyToOne(type => User, user => user.votes, {
		cascadeInsert: false,
		cascadeUpdate: false,
		lazy: false
	})
	@JoinColumn({name: "user"})
	user: User;

	@ManyToOne(type => Resolution, resolution => resolution.votes, {
		cascadeInsert: false,
		cascadeUpdate: false,
		lazy: false
	})
	@JoinColumn({name: "resolution"})
	resolution: Resolution;

	@Column({name: 'vote', nullable: false, default: VoteType.None})
	vote: VoteType;

	@Column({name: 'silver', nullable: false, default: 0})
	silver: number;

	@Column('json', {name: 'details', nullable: true})
	details: any;

	@CreateDateColumn({nullable: true})
	created: Date;

	@UpdateDateColumn({nullable: true})
	updated: Date;
}