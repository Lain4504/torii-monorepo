import { Module } from '@nestjs/common';
import { RoomApiController, RoomController } from './room.controller';
import { NatsClientModule, SharedModule } from '@server/shared';

@Module({
  imports: [
    NatsClientModule,
    SharedModule,
  ],
  controllers: [
    RoomController,
    RoomApiController,
  ],
})
export class RoomModule { }
