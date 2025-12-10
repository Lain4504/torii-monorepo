import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CourseModule } from './modules/course/course.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url:
        process.env.DATABASE_URL ??
        'postgres://postgres:123456789@localhost:5432/torii',
      autoLoadEntities: true,
      synchronize: true,
    }),
    CourseModule,
  ],
})
export class CourseServiceModule {}

