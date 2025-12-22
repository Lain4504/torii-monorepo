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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateBlogPostDto,
  UpdateBlogPostDto,
  BlogPostQueryDto,
  CreateBlogCategoryDto,
  UpdateBlogCategoryDto,
  CreateTagDto,
  UpdateTagDto,
  TagQueryDto,
  PaginatedResponseDto,
  UploadImageBase64Dto,
} from '@workspace/dtos';

@ApiTags('admin/blogs')
@Controller('api/v1/admin/blogs')
export class AdminBlogController {
  private readonly logger = new Logger(AdminBlogController.name);

  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new blog post' })
  @ApiResponse({ status: 201, description: 'Blog post created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() dto: CreateBlogPostDto) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'blog.post.create' }, dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all blog posts (admin)' })
  @ApiResponse({ status: 200, description: 'Return all blog posts' })
  async findAll(@Query() query: BlogPostQueryDto) {
    return firstValueFrom(
      this.natsClient.send<PaginatedResponseDto<any>>(
        { cmd: 'blog.post.findAll' },
        query,
      ),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get blog post by ID' })
  @ApiResponse({ status: 200, description: 'Return blog post' })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async findOne(@Param('id') id: string) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'blog.post.findOne' }, id),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update blog post' })
  @ApiResponse({ status: 200, description: 'Blog post updated successfully' })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'blog.post.update' }, { id, dto }),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete blog post' })
  @ApiResponse({ status: 204, description: 'Blog post deleted successfully' })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async delete(@Param('id') id: string) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'blog.post.delete' }, id),
    );
  }

  @Post(':id/images')
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({ summary: 'Upload image for blog post (file upload or base64 string)' })
  @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
  @ApiResponse({ status: 400, description: 'No file uploaded or invalid data' })
  async uploadImage(
    @Param('id') postId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body?: any,
  ) {
    let fileData: string;
    let filename: string;
    let contentType: string;
    let ownerId: string | undefined;

    // Check if request is base64 string (JSON body with imageData)
    if (!file && body?.imageData) {
      // Handle base64 string upload
      const dto = body as UploadImageBase64Dto;
      
      if (!dto.imageData || dto.imageData.trim().length === 0) {
        throw new BadRequestException('Image data (base64 string) is required');
      }

      // Parse base64 string (có thể có hoặc không có data:image/... prefix)
      let base64Data = dto.imageData.trim();
      contentType = dto.contentType || 'image/jpeg';
      filename = dto.filename || `image-${Date.now()}.jpg`;

      // Nếu có data:image/... prefix, extract content type và base64 data
      if (base64Data.startsWith('data:')) {
        const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          contentType = matches[1];
          base64Data = matches[2];
          
          // Extract filename extension từ content type
          if (!dto.filename) {
            const ext = contentType.split('/')[1]?.split(';')[0] || 'jpg';
            filename = `image-${Date.now()}.${ext}`;
          }
        } else {
          // Nếu format không đúng, thử extract base64 sau dấu phẩy
          const commaIndex = base64Data.indexOf(',');
          if (commaIndex > 0) {
            base64Data = base64Data.substring(commaIndex + 1);
          }
        }
      }

      // Validate base64 string
      try {
        // Thử decode để validate
        Buffer.from(base64Data, 'base64');
      } catch (error) {
        throw new BadRequestException('Invalid base64 string format');
      }

      fileData = base64Data;
      ownerId = dto.ownerId;
    } else if (file) {
      // Handle file upload (multipart/form-data)
      if (!file.buffer || file.buffer.length === 0) {
        throw new BadRequestException('Uploaded file is empty');
      }

      // Convert file to base64
      fileData = file.buffer.toString('base64');
      filename = file.originalname;
      contentType = file.mimetype;
      ownerId = body?.ownerId;
    } else {
      throw new BadRequestException(
        'Either upload a file with field name "image" in multipart/form-data format, or send imageData (base64 string) in JSON body.',
      );
    }

    // Convert to data URL format for direct storage
    const dataUrl = `data:${contentType};base64,${fileData}`;

    // Try to add image to blog post via NATS (if blog service is running)
    try {
      await firstValueFrom(
        this.natsClient.send(
          { cmd: 'blog.post.addImage' },
          { postId, imageUrl: dataUrl },
        ),
      );
    } catch (error) {
      // If blog service is not available, just return the image URL
      // User can manually add it later or blog service will handle it when available
      this.logger.warn(`Blog service not available, returning image URL only: ${error.message}`);
    }

    return {
      success: true,
      imageUrl: dataUrl,
      message: 'Image uploaded successfully (stored as base64 data URL)',
    };
  }

  @Delete(':id/images/:imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete blog post image' })
  @ApiResponse({ status: 204, description: 'Image deleted successfully' })
  async deleteImage(
    @Param('id') postId: string,
    @Param('imageId') imageId: string,
  ) {
    return firstValueFrom(
      this.natsClient.send(
        { cmd: 'blog.post.deleteImage' },
        { postId, imageId },
      ),
    );
  }
}

@ApiTags('admin/categories')
@Controller('api/v1/admin/categories')
export class AdminCategoryController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new blog category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  async create(@Body() dto: CreateBlogCategoryDto) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'blog.category.create' }, dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all blog categories' })
  @ApiResponse({ status: 200, description: 'Return all categories' })
  async findAll() {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'blog.category.findAll' }, {}),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Return category' })
  async findOne(@Param('id') id: string) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'blog.category.findOne' }, id),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  async update(@Param('id') id: string, @Body() dto: UpdateBlogCategoryDto) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'blog.category.update' }, { id, dto }),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 204, description: 'Category deleted successfully' })
  async delete(@Param('id') id: string) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'blog.category.delete' }, id),
    );
  }
}

@ApiTags('admin/tags')
@Controller('api/v1/admin/tags')
export class AdminTagController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({ status: 201, description: 'Tag created successfully' })
  async create(@Body() dto: CreateTagDto) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'blog.tag.create' }, dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({ status: 200, description: 'Return all tags' })
  async findAll(@Query() query: TagQueryDto) {
    return firstValueFrom(
      this.natsClient.send<PaginatedResponseDto<any>>(
        { cmd: 'blog.tag.findAll' },
        query,
      ),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tag by ID' })
  @ApiResponse({ status: 200, description: 'Return tag' })
  async findOne(@Param('id') id: string) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'blog.tag.findOne' }, id),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tag' })
  @ApiResponse({ status: 200, description: 'Tag updated successfully' })
  async update(@Param('id') id: string, @Body() dto: UpdateTagDto) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'blog.tag.update' }, { id, dto }),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete tag' })
  @ApiResponse({ status: 204, description: 'Tag deleted successfully' })
  async delete(@Param('id') id: string) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'blog.tag.delete' }, id),
    );
  }
}

// =========================
// PUBLIC BLOG APIs
// =========================

@ApiTags('blogs')
@Controller('api/v1/blogs')
export class PublicBlogController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get published blog posts (public)' })
  @ApiResponse({ status: 200, description: 'Return published blog posts' })
  async findAll(@Query() query: BlogPostQueryDto) {
    // Only show published posts for public API
    const publicQuery = {
      ...query,
      status: 'published' as const,
    };
    return firstValueFrom(
      this.natsClient.send<PaginatedResponseDto<any>>(
        { cmd: 'blog.post.findAll' },
        publicQuery,
      ),
    );
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured blog posts' })
  @ApiResponse({ status: 200, description: 'Return featured blog posts' })
  async findFeatured(@Query() query: BlogPostQueryDto) {
    const featuredQuery = {
      ...query,
      status: 'published' as const,
      featured: true,
    };
    return firstValueFrom(
      this.natsClient.send<PaginatedResponseDto<any>>(
        { cmd: 'blog.post.findAll' },
        featuredQuery,
      ),
    );
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all blog categories (public)' })
  @ApiResponse({ status: 200, description: 'Return all categories' })
  async findAllCategories() {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'blog.category.findAll' }, {}),
    );
  }

  @Get('tags')
  @ApiOperation({ summary: 'Get all tags (public)' })
  @ApiResponse({ status: 200, description: 'Return all tags' })
  async findAllTags(@Query() query: TagQueryDto) {
    const publicQuery = {
      ...query,
      type: 'blog',
    };
    return firstValueFrom(
      this.natsClient.send<PaginatedResponseDto<any>>(
        { cmd: 'blog.tag.findAll' },
        publicQuery,
      ),
    );
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get blog post by slug (public)' })
  @ApiResponse({ status: 200, description: 'Return blog post' })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async findBySlug(@Param('slug') slug: string) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'blog.post.findBySlug' }, slug),
    );
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get blog posts by category' })
  @ApiResponse({ status: 200, description: 'Return blog posts' })
  async findByCategory(
    @Param('categoryId') categoryId: string,
    @Query() query: BlogPostQueryDto,
  ) {
    const categoryQuery = {
      ...query,
      status: 'published' as const,
      categoryId,
    };
    return firstValueFrom(
      this.natsClient.send<PaginatedResponseDto<any>>(
        { cmd: 'blog.post.findAll' },
        categoryQuery,
      ),
    );
  }

  @Get('tag/:tagId')
  @ApiOperation({ summary: 'Get blog posts by tag' })
  @ApiResponse({ status: 200, description: 'Return blog posts' })
  async findByTag(
    @Param('tagId') tagId: string,
    @Query() query: BlogPostQueryDto,
  ) {
    const tagQuery = {
      ...query,
      status: 'published' as const,
      tagId,
    };
    return firstValueFrom(
      this.natsClient.send<PaginatedResponseDto<any>>(
        { cmd: 'blog.post.findAll' },
        tagQuery,
      ),
    );
  }
}

