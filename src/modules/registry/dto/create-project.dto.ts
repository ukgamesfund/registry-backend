import {State} from '../entity/project.entity'

export class CreativeFounder {
	readonly name: string;
	readonly email: string;
	readonly mobile: string;
	readonly silvertals: number;
	readonly coppertals: number;
}

export class CreateProjectDto {
	readonly name: string;
	readonly projectEmail: string;
	readonly initiatorAddress: string;
	readonly state: State;
	readonly address: string;
	readonly details: any;
	readonly creativeFounders: CreativeFounder[];
}