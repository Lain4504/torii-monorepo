import { IsString, IsOptional, IsUUID, IsArray, IsBoolean, IsInt, IsEnum, Min, Max, IsDateString, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

// =========================
// ENUMS
// =========================

export enum BlogPostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  SPAM = 'spam',
  DELETED = 'deleted',
}

// =========================
// BLOG POST DTOs
// =========================

export class CreateBlogPostDto {
  @IsString()
  title!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsUUID()
  authorId!: string;

  @IsOptional()
  @IsEnum(BlogPostStatus)
  status?: BlogPostStatus;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  readingTime?: number;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  pinned?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metaKeywords?: string[];

  @IsOptional()
  @IsString()
  ogImageUrl?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  relatedPostIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  tagIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[]; // Array of image URLs (base64 data URLs or regular URLs) to add when creating post
}

export class UpdateBlogPostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsEnum(BlogPostStatus)
  status?: BlogPostStatus;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  readingTime?: number;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  pinned?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metaKeywords?: string[];

  @IsOptional()
  @IsString()
  ogImageUrl?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  relatedPostIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  tagIds?: string[];
}

export class BlogPostQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(BlogPostStatus)
  status?: BlogPostStatus;

  @IsOptional()
  @IsUUID()
  authorId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  tagId?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  featured?: boolean;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

// =========================
// BLOG CATEGORY DTOs
// =========================

export class CreateBlogCategoryDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}

export class UpdateBlogCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}

// =========================
// TAG DTOs
// =========================

export class CreateTagDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  type?: string = 'blog';

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;
}

export class UpdateTagDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;
}

export class TagQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  type?: string;
}

// =========================
// BLOG IMAGE UPLOAD DTOs
// =========================

export class UploadImageBase64Dto {
  @IsString()
  @IsNotEmpty()
  imageData!: string; // Base64 string (có thể có hoặc không có data:image/... prefix)

  @IsOptional()
  @IsString()
  filename?: string; // Optional filename, sẽ tự động detect từ base64 hoặc dùng default

  @IsOptional()
  @IsString()
  contentType?: string; // Optional content type, sẽ tự động detect từ base64

  @IsOptional()
  @IsString()
  ownerId?: string; // Optional owner ID
}

// =========================
// BLOG COMMENT DTOs
// =========================

export class CreateBlogCommentDto {
  @IsUUID()
  postId!: string;

  @IsUUID()
  userId!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsUUID()
  parentCommentId?: string;
}

export class UpdateBlogCommentDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(CommentStatus)
  status?: CommentStatus;
}

// =========================
// RESPONSE DTOs
// =========================

export class BlogPostResponseDto {
  id!: string;
  title!: string;
  slug!: string;
  excerpt?: string;
  content!: string;
  coverImageUrl?: string;
  authorId!: string;
  author?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  status!: BlogPostStatus;
  publishedAt?: Date;
  viewCount!: number;
  likeCount!: number;
  commentCount!: number;
  seoTitle?: string;
  seoDescription?: string;
  readingTime?: number;
  featured!: boolean;
  pinned!: boolean;
  metaKeywords!: string[];
  ogImageUrl?: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  relatedPostIds!: string[];
  tags!: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  images!: Array<{
    id: string;
    imageUrl: string;
  }>;
  createdAt!: Date;
  updatedAt!: Date;
}

export class BlogCategoryResponseDto {
  id!: string;
  name!: string;
  slug!: string;
  description?: string;
  icon?: string;
  parentId?: string;
  parent?: BlogCategoryResponseDto;
  orderIndex!: number;
  postCount!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

export class TagResponseDto {
  id!: string;
  name!: string;
  slug!: string;
  type!: string;
  description?: string;
  icon?: string;
  usageCount!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

