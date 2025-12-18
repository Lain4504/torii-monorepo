import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { createTcpClientOptions } from '@server/shared';

import { CourseController } from './course.controller';

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

  controllers: [CourseController],
})
export class CourseModule { }

