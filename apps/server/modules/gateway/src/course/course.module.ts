import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { createTcpClientOptions } from '@server/shared/tcp-client.util';
import { CourseResolver } from './course.resolver';

@Module({
  imports: [
    ClientsModule.register([
      createTcpClientOptions({
        name: 'COURSE_SERVICE',
        hostEnvKey: 'COURSE_HOST',
        portEnvKey: 'COURSE_PORT',
        defaultPort: 8082,
      }),
    ]),
  ],
  providers: [CourseResolver],
})
export class CourseModule {}
