import {Module} from '@nestjs/common';
import {ClientsModule} from '@nestjs/microservices';
import {createTcpClientOptions} from '@server/shared';
import {FlashcardController} from "./flashcard.controller";

@Module({
    imports: [
        ClientsModule.register([
            createTcpClientOptions({
                name: 'AI_SERVICE',
                hostEnvKey: 'AI_HOST',
                portEnvKey: 'AI_PORT',
                defaultPort: 8086,
            }),
        ]),
    ],
    controllers: [FlashcardController],
    exports: [ClientsModule],
})
export class FlashcardModule {
}

