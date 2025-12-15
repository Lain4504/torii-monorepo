import { Module } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'node:path';

import { CourseModule } from './course/course.module';
import { AuthModule } from './auth/auth.module';

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
  ],
  controllers: [],
  providers: [],
})
export class GatewayModule {}
