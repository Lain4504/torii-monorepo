import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WishlistService } from '../../modules/wishlist/wishlist.service';
import {
  type WishlistCreateDTO,
  type WishlistResponseDTO,
  type WishlistQueryDTO,
  type PaginatedResponse,
} from '@workspace/schemas';

@Controller()
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) { }

  @MessagePattern({ cmd: 'wishlist.findAll' })
  async findAll(
    @Payload() query: WishlistQueryDTO,
  ): Promise<PaginatedResponse<WishlistResponseDTO>> {
    return this.wishlistService.findAll(query);
  }

  @MessagePattern({ cmd: 'wishlist.findOne' })
  async findOne(
    @Payload() data: { id: string },
  ): Promise<WishlistResponseDTO | null> {
    return this.wishlistService.findOne(data.id);
  }

  @MessagePattern({ cmd: 'wishlist.create' })
  async create(
    @Payload() input: WishlistCreateDTO,
  ): Promise<WishlistResponseDTO> {
    return this.wishlistService.create(input);
  }

  @MessagePattern({ cmd: 'wishlist.delete' })
  async delete(@Payload() data: { id: string }): Promise<boolean> {
    return this.wishlistService.delete(data.id);
  }
}
