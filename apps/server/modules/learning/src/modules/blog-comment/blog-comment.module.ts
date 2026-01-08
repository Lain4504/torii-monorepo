import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';
import { BlogCommentService } from './blog-comment.service';

@Module({
  imports: [SharedModule],
  controllers: [],
  providers: [BlogCommentService],
  exports: [BlogCommentService],
})
export class BlogCommentModule { }
