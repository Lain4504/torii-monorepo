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
  blogCommentCreateDTOSchema,
  blogCommentUpdateDTOSchema,
  blogCommentQueryDTOSchema,
} from '@workspace/schemas';
import type {
  BlogCommentCreateDTO,
  BlogCommentUpdateDTO,
  BlogCommentQueryDTO,
  BlogCommentResponseDTO,
  PaginatedResponse,
} from '@workspace/schemas';

@Controller('api/v1/blogs/:postId/comments')
export class BlogCommentController {
  private readonly logger = new Logger(BlogCommentController.name);

  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(blogCommentCreateDTOSchema))
  async create(
    @Param('postId') postId: string,
    @Body() dto: Omit<BlogCommentCreateDTO, 'postId'>,
  ): Promise<BlogCommentResponseDTO> {
    const createDto: BlogCommentCreateDTO = {
      ...dto,
      postId,
    } as BlogCommentCreateDTO;

    return firstValueFrom<BlogCommentResponseDTO>(
      this.natsClient.send({ cmd: 'blog.comment.create' }, createDto),
    );
  }

  @Get()
  @UsePipes(new ZodValidationPipe(blogCommentQueryDTOSchema))
  async findAll(
    @Param('postId') postId: string,
    @Query() query: BlogCommentQueryDTO,
  ): Promise<PaginatedResponse<BlogCommentResponseDTO>> {
    const queryWithPostId = { ...query, postId };
    return firstValueFrom<PaginatedResponse<BlogCommentResponseDTO>>(
      this.natsClient.send(
        { cmd: 'blog.comment.findAll' },
        queryWithPostId,
      ),
    );
  }

  @Get(':commentId')
  async findOne(@Param('commentId') commentId: string): Promise<BlogCommentResponseDTO> {
    return firstValueFrom<BlogCommentResponseDTO>(
      this.natsClient.send({ cmd: 'blog.comment.findOne' }, commentId),
    );
  }

  @Get(':commentId/replies')
  async getWithReplies(
    @Param('commentId') commentId: string,
    @Query('depth') depth?: number,
  ): Promise<BlogCommentResponseDTO> {
    return firstValueFrom<BlogCommentResponseDTO>(
      this.natsClient.send(
        { cmd: 'blog.comment.getWithReplies' },
        { commentId, depth: depth || 2 },
      ),
    );
  }

  @Patch(':commentId')
  @UsePipes(new ZodValidationPipe(blogCommentUpdateDTOSchema))
  async update(
    @Param('commentId') commentId: string,
    @Body() dto: BlogCommentUpdateDTO,
    @Query('authorId') authorId: string,
  ): Promise<BlogCommentResponseDTO> {
    return firstValueFrom<BlogCommentResponseDTO>(
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
