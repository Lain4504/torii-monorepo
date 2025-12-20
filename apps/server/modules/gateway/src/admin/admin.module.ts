import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { NatsClientModule } from '@server/shared';

@Module({
    imports: [NatsClientModule],
    controllers: [UsersController],
})
export class AdminModule { }
