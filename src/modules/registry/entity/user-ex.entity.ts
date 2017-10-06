import {
	Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';


// holds ethereum related attributes

@Entity()
export class UserEx {
	constructor() {
	}

	@PrimaryColumn('int', {generated: true})
	id: number;

	@Column({name: 'address', nullable: false, unique: true})
	address: string;

	// add here ethereum related attributes

	@CreateDateColumn({nullable: true})
	created: Date;

	@UpdateDateColumn({nullable: true})
	updated: Date;
}