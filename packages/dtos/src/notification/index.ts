import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginatedResponseDto } from '../common';

export enum NotificationType {
  SYSTEM = 'system',
  COURSE = 'course',
  LIVE_CLASS = 'live_class',
  PAYMENT = 'payment',
  ACHIEVEMENT = 'achievement',
  REMINDER = 'reminder',
}

export class NotificationResponseDto {
  id: string;
  userId: string;
  title: string;
  message: string;
  notificationType: NotificationType;
  data?: any; // JSONB data for deep linking
  isRead: boolean;
  readAt?: Date;
  sentVia: string[]; // Array of 'email', 'push', 'in_app'
  createdAt: Date;
}

export class NotificationQueryDto {
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit: number = 10;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isRead?: boolean; // Filter by read status
}

export class CreateNotificationDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsEnum(NotificationType)
  @IsNotEmpty()
  notificationType!: NotificationType;

  @IsOptional()
  data?: any; // JSONB data

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sentVia?: string[]; // Default to ['in_app']
}

export class MarkAsReadRequestDto {
  @IsUUID()
  @IsNotEmpty()
  notificationId!: string;

  @IsUUID()
  @IsNotEmpty()
  userId!: string;
}

export class MarkAllAsReadRequestDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;
}

export class DeleteNotificationRequestDto {
  @IsUUID()
  @IsNotEmpty()
  notificationId!: string;

  @IsUUID()
  @IsNotEmpty()
  userId!: string;
}

export class UnreadCountResponseDto {
  success: boolean;
  message: string;
  data: {
    count: number;
  };
}

export class NotificationListResponseDto extends PaginatedResponseDto<NotificationResponseDto> {}



