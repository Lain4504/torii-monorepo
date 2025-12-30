import { Module } from '@nestjs/common';
import { PrismaModule } from '@server/shared';
import { WishlistService } from './wishlist.service';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [WishlistService],
  exports: [WishlistService],
})
export class WishlistModule { }
