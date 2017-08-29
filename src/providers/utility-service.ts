

export class Utils {

	static add0x(input) {
		if (typeof(input) !== 'string') {
			return input;
		}
		else if (input.length < 2 || input.slice(0, 2) !== '0x') {
			return '0x' + input;
		}
		else {
			return input;
		}
	}

	static strip0x(input) {
		if (typeof(input) !== 'string') {
			return input;
		}
		else if (input.length >= 2 && input.slice(0, 2) === '0x') {
			return input.slice(2);
		}
		else {
			return input;
		}
	}
}


export enum Status  {
	None = 0,
	Confirmed,
	Rejected,
	Suspended,
	Terminated
}

export enum ResStatus {
	None = 0,
	Created,
	Committed,
	Suspended,
	Cancelled,
	Expired,
	Passed,
	Rejected,
	Executing,
	Executed
}

export enum TokenType  {
	None = 0,
	Silver,
	Copper,
	Sodium
}

export enum VoteType {
	None = 0,
	Confirm,
	Reject
}

export const CONST = {

	NOT_A_MEMBER: 0xff,

	SECONDS_1D: 86400,
	SECONDS_7D: 86400*7,
	SECONDS_1M: 86400*28,

	GOLD_ACCOUNT: "ac.gold",
}
