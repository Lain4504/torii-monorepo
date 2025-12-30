import { Module } from '@nestjs/common';
import { PrismaModule } from '@server/shared';
import { NotificationService } from './notification.service';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule { }



