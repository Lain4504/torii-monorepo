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
  CreateBlogCommentDto,
  UpdateBlogCommentDto,
  BlogCommentQueryDto,
} from '@workspace/dtos';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('admin/blogs')
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

// =========================
// BLOG COMMENT CONTROLLER (Public API)
// =========================

@Controller('api/v1/blogs/:postId/comments')
export class BlogCommentController {
  private readonly logger = new Logger(BlogCommentController.name);

  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('postId') postId: string,
    @Body() dto: Omit<CreateBlogCommentDto, 'postId'>,
  ) {
    const createDto: CreateBlogCommentDto = {
      ...dto,
      postId,
    } as CreateBlogCommentDto;
    
    return firstValueFrom(
      this.natsClient.send({ cmd: 'blog.comment.create' }, createDto),
    );
  }

  @Get()
  async findAll(
    @Param('postId') postId: string,
    @Query() query: BlogCommentQueryDto,
  ) {
    const queryWithPostId = { ...query, postId };
    return firstValueFrom(
      this.natsClient.send<PaginatedResponseDto<any>>(
        { cmd: 'blog.comment.findAll' },
        queryWithPostId,
      ),
    );
  }

  @Get(':commentId')
  async findOne(@Param('commentId') commentId: string) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'blog.comment.findOne' }, commentId),
    );
  }

  @Get(':commentId/replies')
  async getWithReplies(
    @Param('commentId') commentId: string,
    @Query('depth') depth?: number,
  ) {
    return firstValueFrom(
      this.natsClient.send(
        { cmd: 'blog.comment.getWithReplies' },
        { commentId, depth: depth || 2 },
      ),
    );
  }

  @Patch(':commentId')
  async update(
    @Param('commentId') commentId: string,
    @Body() dto: UpdateBlogCommentDto,
    @Query('authorId') authorId: string, // Temporary - should come from auth
  ) {
    return firstValueFrom(
      this.natsClient.send(
        { cmd: 'blog.comment.update' },
        { id: commentId, authorId, dto },
      ),
    );
  }

  @Delete(':commentId')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('commentId') commentId: string,
    @Query('authorId') authorId: string, // Temporary - should come from auth
  ) {
    return firstValueFrom(
      this.natsClient.send(
        { cmd: 'blog.comment.delete' },
        { id: commentId, authorId },
      ),
    );
  }
}


