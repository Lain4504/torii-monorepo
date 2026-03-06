import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaymentMethod } from '@prisma/generated';

export class OrderCheckoutDto {
    @IsArray()
    @IsUUID('4', { each: true })
    offeringIds!: string[];

    @IsOptional()
    @IsString()
    couponCode?: string;

    @IsEnum(PaymentMethod)
    paymentMethod!: PaymentMethod;
}

export class OrderPreviewDto {
    @IsArray()
    @IsUUID('4', { each: true })
    offeringIds!: string[];

    @IsOptional()
    @IsString()
    couponCode?: string;
}
