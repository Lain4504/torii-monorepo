import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { PollsGatewayController } from './polls.controller';

@Module({
    imports: [NatsClientModule],
    controllers: [PollsGatewayController],
    providers: [],
    exports: [],
})
export class PollsModule { }
