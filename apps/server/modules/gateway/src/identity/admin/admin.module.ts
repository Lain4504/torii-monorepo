import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { NatsClientModule, SharedModule } from '@server/shared';

@Module({
    imports: [NatsClientModule, SharedModule],
    controllers: [UsersController],
    providers: [],
})
export class AdminModule { }
