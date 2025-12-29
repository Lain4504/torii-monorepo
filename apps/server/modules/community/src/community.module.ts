import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@server/shared';
import { BlogModule } from './blog/blog.module';
import { BlogCommentModule } from './blog-comment/blog-comment.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    BlogModule,
    BlogCommentModule,
    NotificationModule,
  ],
})
export class CommunityModule {}
