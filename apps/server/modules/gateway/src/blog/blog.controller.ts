import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateBlogPostDto,
  UpdateBlogPostDto,
  BlogPostQueryDto,
  PaginatedResponseDto,
} from '@workspace/dtos';

@Controller('api/v1/admin/blogs')
export class AdminBlogController {
  private readonly logger = new Logger(AdminBlogController.name);

  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateBlogPostDto) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'blog.post.create' }, dto),
    );
  }

  @Get()
  async findAll(@Query() query: BlogPostQueryDto) {
    return firstValueFrom(
      this.natsClient.send<PaginatedResponseDto<any>>(
        { cmd: 'blog.post.findAll' },
        query,
      ),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'blog.post.findOne' }, id),
    );
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'blog.post.update' }, { id, dto }),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'blog.post.delete' }, id),
    );
  }
}


