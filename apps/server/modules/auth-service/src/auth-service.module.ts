import { Module } from '@nestjs/common';
import { SupabaseModule } from '@server/shared';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';

@Module({
  imports: [SupabaseModule],
  controllers: [AuthServiceController],
  providers: [AuthServiceService],
})
export class AuthServiceModule { }
