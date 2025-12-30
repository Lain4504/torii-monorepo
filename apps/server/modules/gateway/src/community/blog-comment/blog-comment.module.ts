import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { BlogCommentController } from './blog-comment.controller';

@Module({
  imports: [NatsClientModule],
  controllers: [BlogCommentController],
})
export class BlogCommentModule {}
