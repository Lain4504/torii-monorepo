import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RoomModule } from './room/room.module';
import { SharedModule } from '@server/shared';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        SharedModule,
        RoomModule,
    ],
})
export class RoomServiceModule { }
