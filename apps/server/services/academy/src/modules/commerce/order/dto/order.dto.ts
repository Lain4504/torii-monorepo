import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
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
}
