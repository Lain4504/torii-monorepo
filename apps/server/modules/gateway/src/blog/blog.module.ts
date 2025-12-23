import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import {
  AdminBlogController,
  AdminTagController,
} from './blog.controller';

@Module({
  imports: [NatsClientModule],
  controllers: [
    AdminBlogController,
    AdminTagController,
  ],
})
export class BlogModule {}




