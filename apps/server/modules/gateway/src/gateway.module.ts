import { Module } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'node:path';

import { CourseModule } from './course/course.module';
import { AuthModule } from './auth/auth.module';
import { SharedModule, NatsAuthModule } from '@server/shared';
import { RoomModule } from './room/room.module';
import { FileModule } from './file/file.module';

import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ApiKeyGuard } from '@server/shared/guards/api-key.guard';
import { SystemWorkerService } from './system-worker.service';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'modules/gateway/schema.gql'),
      sortSchema: true,
      playground: false,
      graphiql: true,
      useGlobalPrefix: false,
    }),
    AuthModule,
    CourseModule,
    SharedModule,
    NatsAuthModule, // Auth callout handler - only in Gateway
    RoomModule,
    FileModule,
  ],
  controllers: [GatewayController],
  providers: [GatewayService, ApiKeyGuard, SystemWorkerService],
})
export class GatewayModule { }
