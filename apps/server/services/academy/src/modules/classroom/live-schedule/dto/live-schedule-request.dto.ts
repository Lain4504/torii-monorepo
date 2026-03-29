import {
  IsDateString,
  IsInt,
  IsIn,
  Max,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class LiveScheduleRequestCreateDto {
  @IsUUID()
  sessionId!: string;

  @IsString()
  @IsIn(['LEAVE', 'RESCHEDULE'])
  type!: 'LEAVE' | 'RESCHEDULE';

  @IsOptional()
  @IsDateString()
  requestedDate?: string;

  @IsOptional()
  @IsDateString()
  proposedDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  proposedStartTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  proposedEndTime?: string;

  @IsOptional()
  @IsUUID()
  proposedTeacherId?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class LiveScheduleRequestApproveDto {
  @IsOptional()
  @IsString()
  reviewNote?: string;
}

export class LiveScheduleRequestRejectDto {
  @IsString()
  reviewNote!: string;
}

export class LiveScheduleRequestQueryDto {
  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'])
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

  @IsOptional()
  @IsUUID()
  requestedBy?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}


export class LiveScheduleConflictPreviewDto {
  @IsUUID()
  classId!: string;

  @IsOptional()
  @IsUUID()
  excludeSessionId?: string;

  @IsDateString()
  sessionDate!: string;

  @IsString()
  @MaxLength(20)
  startTime!: string;

  @IsString()
  @MaxLength(20)
  endTime!: string;
}
