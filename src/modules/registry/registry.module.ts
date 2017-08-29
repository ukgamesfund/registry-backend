import {Module, NestModule, RequestMethod, MiddlewaresConsumer, OnModuleInit} from '@nestjs/common';
import {SecurityController} from "./controller/security.controller";
import {EthereumController} from "./controller/ethereum.controller";
import {DatabaseService} from "./database/database.service";
import {UsersService} from "./service/users.service";
import {UsersController} from "./controller/users.controller";
import {SecurityMiddleware} from "./middleware/security.middleware";
import {EthereumService} from "./service/ethereum.service";

@Module({
	modules: [],
	controllers: [
		EthereumController,
		UsersController,
		SecurityController,
	],
	components: [
		UsersService,
		DatabaseService,
		EthereumService,
	],
})
export class RegistryModule implements NestModule {
	public configure(consumer: MiddlewaresConsumer) {
		consumer.apply(SecurityMiddleware).forRoutes(
			{path: 'api/user*', method: RequestMethod.ALL},
			{path: 'api/ethereum*', method: RequestMethod.ALL},
		);
	}
}