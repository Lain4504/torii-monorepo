import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from '@server/shared';
import { BlogModule } from './modules/blog/blog.module';
import { BlogCommentModule } from './modules/blog-comment/blog-comment.module';
import { NotificationModule } from './modules/notification/notification.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';

import { BlogController } from './interfaces/http/blog.controller';
import { BlogCommentController } from './interfaces/http/blog-comment.controller';
import { NotificationController } from './interfaces/http/notification.controller';
import { WishlistController } from './interfaces/http/wishlist.controller';
import { NotificationEventController } from './interfaces/nats/notification-event.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedModule,
    BlogModule,
    BlogCommentModule,
    NotificationModule,
    WishlistModule,
  ],
  controllers: [
    // HTTP Controllers
    BlogController,
    BlogCommentController,
    NotificationController,
    WishlistController,

    // NATS Event Controllers
    NotificationEventController
  ],
})
export class CommunityModule { }
