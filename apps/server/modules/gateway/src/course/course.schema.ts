import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

// --- Entity ---
@ObjectType()
export class Course {
  @Field(() => Int)
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the course',
  })
  id!: number;

  @Field()
  @ApiProperty({
    example: 'Introduction to NestJS',
    description: 'The title of the course',
  })
  title!: string;

  @Field(() => String, { nullable: true })
  @ApiPropertyOptional({
    type: String,
    example: 'A comprehensive guide...',
    description: 'The description of the course',
  })
  description?: string | null;

  @Field(() => Float)
  @ApiProperty({ example: 49.99, description: 'The price of the course' })
  price!: number;

  @Field()
  @ApiProperty({
    example: true,
    description: 'Whether the course is published',
  })
  published!: boolean;

  @Field()
  @ApiProperty({ description: 'The creation date of the course' })
  createdAt!: Date;

  @Field()
  @ApiProperty({ description: 'The last update date of the course' })
  updatedAt!: Date;
}

// --- Inputs ---

@InputType()
export class CreateCourseInput {
  @Field()
  @IsString()
  @MaxLength(255)
  @ApiProperty({
    example: 'New Course Title',
    description: 'The title of the new course',
  })
  title!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    type: String,
    example: 'Course description',
    description: 'The description of the new course',
  })
  description?: string | null;

  @Field(() => Float)
  @IsNumber()
  @ApiProperty({ example: 99.99, description: 'The price of the new course' })
  price!: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    example: false,
    description: 'Whether the new course is published',
  })
  published?: boolean;
}

@InputType()
export class UpdateCourseInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiPropertyOptional({
    example: 'Updated Title',
    description: 'The updated title of the course',
  })
  title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    type: String,
    example: 'Updated description',
    description: 'The updated description of the course',
  })
  description?: string | null;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    example: 59.99,
    description: 'The updated price of the course',
  })
  price?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    example: true,
    description: 'Whether the course is published',
  })
  published?: boolean;
}
