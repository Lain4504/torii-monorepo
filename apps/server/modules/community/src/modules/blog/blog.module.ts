import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';
import { BlogService } from './blog.service';

@Module({
  imports: [SharedModule],
  controllers: [],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule { }












