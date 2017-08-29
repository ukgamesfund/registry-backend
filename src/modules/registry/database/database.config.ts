
import {ConnectionOptions} from "typeorm";

import {User} from "../entity/user.entity";
import {Membership} from "../entity/membership.entity";
import {Resolution} from "../entity/resolution.entity";
import {Vote} from "../entity/vote.entity";
import {Project} from "../entity/project.entity";

export class DatabaseConfig {
    public getConfiguration(): ConnectionOptions {
        return {
            type: "mysql",
            host: process.env.DB_HOST,
            port: Number.parseInt(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,

            autoSchemaSync: true,
            entities: [
                User, Membership, Resolution, Vote, Project
            ],
	        logging: 'all'
        };
    }
}
