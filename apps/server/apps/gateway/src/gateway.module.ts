import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'node:path';

import { createTcpClientOptions } from '@server/shared/tcp-client.util';
import { CourseModule } from './course/course.module';
import { GatewayController } from './gateway.controller';
import { GatewayResolver } from './gateway.resolver';
import { GatewayService } from './gateway.service';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'apps/gateway/schema.gql'),
      sortSchema: true,
      playground: false,
      graphiql: true,
    }),
    ClientsModule.register([
      createTcpClientOptions({
        name: 'AUTH_SERVICE',
        hostEnvKey: 'AUTH_HOST',
        portEnvKey: 'AUTH_PORT',
        defaultPort: 8081,
      }),
    ]),
    CourseModule,
  ],
  controllers: [GatewayController],
  providers: [GatewayService, GatewayResolver],
})
export class GatewayModule {}
