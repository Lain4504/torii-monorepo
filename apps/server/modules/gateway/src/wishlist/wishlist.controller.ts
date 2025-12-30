import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '@server/shared/pipes/zod-validation.pipe';
import {
  type WishlistCreateDTO,
  type WishlistResponseDTO,
  type PaginatedResponse,
  type WishlistQueryDTO,
  wishlistCreateDTOSchema,
  wishlistQueryDTOSchema,
} from '@workspace/schemas';

@Controller('api/wishlist')
export class WishlistController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(wishlistCreateDTOSchema))
  async create(@Body() input: WishlistCreateDTO): Promise<WishlistResponseDTO> {
    return firstValueFrom(
      this.natsClient.send<WishlistResponseDTO>(
        { cmd: 'wishlist.create' },
        input,
      ),
    );
  }

  @Get()
  @UsePipes(new ZodValidationPipe(wishlistQueryDTOSchema))
  async findAll(
    @Query() query: WishlistQueryDTO,
  ): Promise<PaginatedResponse<WishlistResponseDTO>> {
    return firstValueFrom(
      this.natsClient.send<PaginatedResponse<WishlistResponseDTO>>(
        { cmd: 'wishlist.findAll' },
        query,
      ),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<WishlistResponseDTO | null> {
    return firstValueFrom(
      this.natsClient.send<WishlistResponseDTO | null>(
        { cmd: 'wishlist.findOne' },
        { id },
      ),
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<boolean> {
    return firstValueFrom(
      this.natsClient.send<boolean>({ cmd: 'wishlist.delete' }, { id }),
    );
  }
}
