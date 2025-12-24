import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { AdminBlogController, BlogCommentController } from './blog.controller';

@Module({
  imports: [NatsClientModule],
  controllers: [AdminBlogController, BlogCommentController],
})
export class BlogModule {}




