import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { WishlistController } from './wishlist.controller';

@Module({
  imports: [NatsClientModule],
  controllers: [WishlistController],
})
export class WishlistModule {}
