import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsObject,
} from 'class-validator';
import { PaymentMethod } from '@prisma/generated';

export class OrderCheckoutDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  vodPackageIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cohortIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subscriptionPlanIds?: string[];

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  metadata?: any;

  @IsOptional()
  @IsObject()
  liveClassIdByCohort?: Record<string, string>;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsOptional()
  @IsString()
  paymentGateway?: string;
}

export class OrderPreviewDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  vodPackageIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cohortIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subscriptionPlanIds?: string[];

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  liveClassIdByCohort?: Record<string, string>;
}
