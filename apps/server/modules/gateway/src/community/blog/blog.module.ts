import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { AdminBlogController } from './blog.controller';

@Module({
  imports: [NatsClientModule],
  controllers: [AdminBlogController],
})
export class BlogModule {}




