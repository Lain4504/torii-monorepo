import { Module } from '@nestjs/common';
import { BlogModule } from './blog/blog.module';
import { BlogCommentModule } from './blog-comment/blog-comment.module';
import { NotificationModule } from './notification/notification.module';
import { WishlistModule } from './wishlist/wishlist.module';

@Module({
    imports: [
        BlogModule,
        BlogCommentModule,
        NotificationModule,
        WishlistModule,
    ],
})
export class CommunityGatewayModule { }
