import {Module, NestModule, RequestMethod, MiddlewaresConsumer, OnModuleInit} from '@nestjs/common';
import {SecurityController} from "./controller/security.controller";
import {EthereumController} from "./controller/ethereum.controller";
import {DatabaseService} from "./database/database.service";
import {UsersService} from "./service/users.service";
import {UsersController} from "./controller/users.controller";
import {SecurityMiddleware} from "./middleware/security.middleware";
import {EthereumService} from "./service/ethereum.service";
import {PingController} from "./controller/ping.controller";
import {EmailService} from "./service/email.service";
import {ConfirmationService} from "./service/confirmation.service";

@Module({
	modules: [],
	controllers: [
		EthereumController,
		UsersController,
		SecurityController,
		PingController,
	],
	components: [
		UsersService,
		DatabaseService,
		EthereumService,
		EmailService,
		ConfirmationService,
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