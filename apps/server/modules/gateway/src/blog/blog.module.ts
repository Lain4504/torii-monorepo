import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import {
  AdminBlogController,
  AdminCategoryController,
  AdminTagController,
  PublicBlogController,
} from './blog.controller';

@Module({
  imports: [NatsClientModule],
  controllers: [
    AdminBlogController,
    AdminCategoryController,
    AdminTagController,
    PublicBlogController,
  ],
})
export class BlogModule {}




