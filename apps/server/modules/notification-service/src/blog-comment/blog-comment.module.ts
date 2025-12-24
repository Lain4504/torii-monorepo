import { Module } from '@nestjs/common';
import { SupabaseModule, SharedModule } from '@server/shared';
import { BlogCommentController } from './blog-comment.controller';
import { BlogCommentService } from './blog-comment.service';

@Module({
  imports: [SharedModule, SupabaseModule],
  controllers: [BlogCommentController],
  providers: [BlogCommentService],
  exports: [BlogCommentService],
})
export class BlogCommentModule {}
