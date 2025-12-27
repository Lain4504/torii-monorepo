import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { NatsClientModule, SupabaseModule } from '@server/shared';

@Module({
    imports: [NatsClientModule, SupabaseModule],
    controllers: [UsersController],
})
export class AdminModule { }
