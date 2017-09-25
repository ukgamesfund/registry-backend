import {
	Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn
} from 'typeorm';


@Entity()
export class Confirmation {
	constructor() {
	}

	@PrimaryColumn('int', {generated: true})
	id: number;

	@Column({name: 'email', nullable: false, unique: true})
	email: string;

	@Column({name: 'code', nullable: true})
	code: string;

	@Column({name: 'retries', nullable: true, default: 0})
	retries: number;

	@Column({name: 'confirmed', nullable: false, default: false})
	confirmed: boolean;

	@CreateDateColumn({nullable: true})
	created: Date;

	@UpdateDateColumn({nullable: true})
	updated: Date;
}