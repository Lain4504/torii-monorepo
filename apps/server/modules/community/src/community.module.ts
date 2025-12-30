import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@server/shared';
import { BlogModule } from './modules/blog/blog.module';
import { BlogCommentModule } from './modules/blog-comment/blog-comment.module';
import { NotificationModule } from './modules/notification/notification.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';

import { BlogController } from './interfaces/nats/blog.controller';
import { BlogCommentController } from './interfaces/nats/blog-comment.controller';
import { NotificationController } from './interfaces/nats/notification.controller';
import { WishlistController } from './interfaces/nats/wishlist.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    BlogModule,
    BlogCommentModule,
    NotificationModule,
    WishlistModule,
  ],
  controllers: [BlogController, BlogCommentController, NotificationController, WishlistController],
})
export class CommunityModule { }
