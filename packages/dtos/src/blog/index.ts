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


// =========================
// BLOG POST DTOs
// =========================

export class CreateBlogPostDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  slug?: string; // Optional - sẽ tự động generate từ title nếu không có

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
  @IsArray()
  @IsString({ each: true })
  tags?: string[]; // Array of tag names (e.g., ["Grammar", "Vocabulary"])

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[]; // Array of image URLs - images are stored in FileAsset via storage service
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
  @IsArray()
  @IsString({ each: true })
  tags?: string[]; // Array of tag names (e.g., ["Grammar", "Vocabulary"])
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
  @IsString()
  tagId?: string; // Tag name to filter by (e.g., "Grammar")

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
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
  tags!: string[]; // Array of tag names
  // Images are stored in FileAsset table via storage service
  // Query FileAsset with moduleOrigin='BLOG' and ownerId=post.id to get images
  createdAt!: Date;
  updatedAt!: Date;
}


