import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { createTcpClientOptions } from '@server/shared/tcp-client.util';
import { CourseResolver } from './course.resolver';
import { CourseService } from './course.service';

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
  providers: [CourseResolver, CourseService],
})
export class CourseModule {}
