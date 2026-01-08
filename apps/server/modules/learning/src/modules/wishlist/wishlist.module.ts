import { Module } from '@nestjs/common';
import { PrismaModule } from '@server/shared';
import { WishlistService } from './wishlist.service';
import { WishlistRepository } from './wishlist.repository';

/**
 * Wishlist Feature Module
 * Handles wishlist operations
 */
@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [WishlistRepository, WishlistService],
  exports: [WishlistService],
})
export class WishlistModule { }
