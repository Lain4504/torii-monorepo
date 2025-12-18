import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';
import { UserTrackingService } from './user-tracking.service';

@Module({
    imports: [SharedModule],
    providers: [UserTrackingService],
    exports: [UserTrackingService],
})
export class UserTrackingModule { }
