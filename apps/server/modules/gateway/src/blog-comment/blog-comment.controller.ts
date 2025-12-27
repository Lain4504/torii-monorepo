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
  CreateBlogCommentDto,
  UpdateBlogCommentDto,
  BlogCommentQueryDto,
  PaginatedResponseDto,
} from '@workspace/dtos';

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
    @Query('authorId') authorId: string,
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
    @Query('authorId') authorId: string,
  ) {
    return firstValueFrom(
      this.natsClient.send(
        { cmd: 'blog.comment.delete' },
        { id: commentId, authorId },
      ),
    );
  }
}
