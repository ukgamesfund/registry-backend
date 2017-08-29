import {Module} from '@nestjs/common';
import {RegistryModule} from "../registry/registry.module";

@Module({
	modules: [RegistryModule],
})
export class ApplicationModule {
}