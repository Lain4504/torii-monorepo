import { IsArray, IsEnum, IsOptional, IsString, IsObject } from 'class-validator';
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

    /** For LIVE offerings: map offeringId -> selected classId (one class per offering) */
    @IsOptional()
    @IsObject()
    classIdByOffering?: Record<string, string>;

    @IsOptional()
    @IsString()
    couponCode?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    metadata?: any;

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

    /** For LIVE offerings: map offeringId -> selected classId */
    @IsOptional()
    @IsObject()
    classIdByOffering?: Record<string, string>;

    @IsOptional()
    @IsString()
    couponCode?: string;

    @IsOptional()
    @IsString()
    description?: string;
}
