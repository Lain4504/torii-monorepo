import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';

@Module({
  imports: [SharedModule],
  controllers: [BlogController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule { }












