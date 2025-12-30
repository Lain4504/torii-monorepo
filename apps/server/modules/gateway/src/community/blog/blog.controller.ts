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
  UsePipes,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ZodValidationPipe } from '@server/shared/pipes/zod-validation.pipe';
import {
  blogPostCreateDTOSchema,
  blogPostUpdateDTOSchema,
  blogPostQueryDTOSchema,
} from '@workspace/schemas';
import type {
  BlogPostCreateDTO,
  BlogPostUpdateDTO,
  BlogPostQueryDTO,
  BlogPostResponseDTO,
  PaginatedResponse,
} from '@workspace/schemas';

@Controller('api/v1/admin/blogs')
export class AdminBlogController {
  private readonly logger = new Logger(AdminBlogController.name);

  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(blogPostCreateDTOSchema))
  async create(@Body() dto: BlogPostCreateDTO): Promise<BlogPostResponseDTO> {
    return firstValueFrom<BlogPostResponseDTO>(
      this.natsClient.send({ cmd: 'blog.post.create' }, dto),
    );
  }

  @Get()
  @UsePipes(new ZodValidationPipe(blogPostQueryDTOSchema))
  async findAll(@Query() query: BlogPostQueryDTO): Promise<PaginatedResponse<BlogPostResponseDTO>> {
    return firstValueFrom<PaginatedResponse<BlogPostResponseDTO>>(
      this.natsClient.send(
        { cmd: 'blog.post.findAll' },
        query,
      ),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BlogPostResponseDTO> {
    return firstValueFrom<BlogPostResponseDTO>(
      this.natsClient.send({ cmd: 'blog.post.findOne' }, id),
    );
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(blogPostUpdateDTOSchema))
  async update(@Param('id') id: string, @Body() dto: BlogPostUpdateDTO): Promise<BlogPostResponseDTO> {
    return firstValueFrom<BlogPostResponseDTO>(
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


