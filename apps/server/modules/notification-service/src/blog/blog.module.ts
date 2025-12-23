import { Module } from '@nestjs/common';
import { SupabaseModule, SharedModule } from '@server/shared';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';

@Module({
  imports: [SharedModule, SupabaseModule],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}




