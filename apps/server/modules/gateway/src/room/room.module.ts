import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RoomController } from './room.controller';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'ROOM_SERVICE',
                transport: Transport.REDIS,
                options: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379'),
                },
            },
        ]),
    ],
    controllers: [RoomController],
})
export class RoomModule { }
