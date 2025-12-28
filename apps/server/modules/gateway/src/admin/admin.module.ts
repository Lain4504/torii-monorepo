import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { NatsClientModule, SharedModule } from '@server/shared';

@Module({
    imports: [NatsClientModule, SharedModule],
    controllers: [UsersController],
})
export class AdminModule { }
