import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
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
    id!: number;

    @Field()
    title!: string;

    @Field(() => String, { nullable: true })
    description?: string | null;

    @Field(() => Float)
    price!: number;

    @Field()
    published!: boolean;

    @Field()
    createdAt!: Date;

    @Field()
    updatedAt!: Date;
}

// --- Inputs ---

@InputType()
export class CreateCourseInput {
    @Field()
    @IsString()
    @MaxLength(255)
    title!: string;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    description?: string | null;

    @Field(() => Float)
    @IsNumber()
    price!: number;

    @Field({ nullable: true })
    @IsOptional()
    @IsBoolean()
    published?: boolean;
}

@InputType()
export class UpdateCourseInput {
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    title?: string;

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    description?: string | null;

    @Field(() => Float, { nullable: true })
    @IsOptional()
    @IsNumber()
    price?: number;

    @Field({ nullable: true })
    @IsOptional()
    @IsBoolean()
    published?: boolean;
}
