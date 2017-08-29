


export enum ENV {
	Simulator = 1,
	Device,
	Cloud,
}

export class Config {
	private static env: ENV = ENV.Cloud


	public static get ORIGIN_HOST(): string {
		if (Config.env == ENV.Simulator) {
			return 'http://192.168.58.1:8100'
		}

		if (Config.env == ENV.Device) {
			return 'http://192.168.86.22:8100'
		}

		if (Config.env == ENV.Cloud) {
			return "http://services.talregistry.com"
		}

		return undefined
	}
}


