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
  offeringIds?: string[];

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
  classIdByOffering?: Record<string, string>;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;
}

export class OrderPreviewDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  offeringIds?: string[];

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
  classIdByOffering?: Record<string, string>;
}
