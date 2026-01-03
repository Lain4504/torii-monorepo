import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from '@server/shared';
import { BlogModule } from './modules/blog/blog.module';
import { BlogCommentModule } from './modules/blog-comment/blog-comment.module';
import { NotificationModule } from './modules/notification/notification.module';



import { BlogController } from './interfaces/http/blog.controller';
import { BlogCommentController } from './interfaces/http/blog-comment.controller';
import { NotificationController } from './interfaces/http/notification.controller';
import { EmailEventController } from './interfaces/event/email.event.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedModule,
    BlogModule,
    BlogCommentModule,
    NotificationModule,
  ],
  controllers: [
    // HTTP Controllers
    BlogController,
    BlogCommentController,
    NotificationController,

    // Event Controllers
    EmailEventController,
  ],
})
export class CommunityModule { }
