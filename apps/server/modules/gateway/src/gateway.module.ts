import { Module } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'node:path';

import { CourseModule } from './course/course.module';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from '@server/shared';
import { RoomModule } from './room/room.module';
import { FileModule } from './file/file.module';


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
    RoomModule,
    FileModule,
  ],
  controllers: [],
  providers: [],
})
export class GatewayModule { }
