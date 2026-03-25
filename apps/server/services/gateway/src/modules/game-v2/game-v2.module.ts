import { Module } from '@nestjs/common';
import { GameV2Controller } from './controllers/game-v2.controller';
import { NatsClientModule, PrismaModule } from '@server/shared';

@Module({
  imports: [PrismaModule, NatsClientModule],
  controllers: [GameV2Controller],
  providers: [],
})
export class GameV2Module {}

