import {createConnection, Connection, EntityManager, Repository, ObjectType,} from 'typeorm';
import {DatabaseConfig} from './database.config';

export class DatabaseService {

	private _connection: Connection;
	private databaseConfig: DatabaseConfig;

	constructor() {
		this.databaseConfig = new DatabaseConfig();
	}

	private get connection(): Promise<Connection> {
		// return the connection if it's been created already
		if (this._connection) return Promise.resolve(this._connection);
		// otherwise create it
		return createConnection(this.databaseConfig.getConfiguration()).then(connection => {
			this._connection = connection;
			return connection;
		}).catch(error => {
			console.log(error);
			throw error;
		});
	}

	public async getEntityManager(): Promise<EntityManager> {
		return (await this.connection).entityManager;
	}

	public async getRepository<T>(entityClassOrName: ObjectType<T> | string): Promise<Repository<T>> {
		return (await this.connection).getRepository<T>(entityClassOrName);
	}
}