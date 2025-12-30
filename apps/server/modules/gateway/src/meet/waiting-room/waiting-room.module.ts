/**
 * Waiting Room Module (Gateway)
 * 
 * Provides waiting room functionality for the Gateway
 */

import { Module } from '@nestjs/common';
import { WaitingRoomController } from './waiting-room.controller';
import { NatsClientModule } from '@server/shared';

@Module({
    imports: [NatsClientModule],
    controllers: [WaitingRoomController],
    providers: [],
})
export class WaitingRoomModule { }
