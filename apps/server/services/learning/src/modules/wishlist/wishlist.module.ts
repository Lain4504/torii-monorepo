import { Module } from '@nestjs/common';
import { PrismaModule } from '@server/shared';
import { WishlistService } from '@server/learning/modules/wishlist/wishlist.service';
import { WishlistRepository } from '@server/learning/modules/wishlist/wishlist.repository';
import { WishlistProfile } from '@server/learning/infrastructure/mappings/wishlist.profile';

/**
 * Wishlist Feature Module
 * Handles wishlist operations
 */
@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [WishlistRepository, WishlistService, WishlistProfile],
  exports: [WishlistService],
})
export class WishlistModule { }
