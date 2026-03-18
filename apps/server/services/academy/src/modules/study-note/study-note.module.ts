import { Module } from '@nestjs/common';
import { StudyNoteService } from './study-note.service';
import { StudyNoteHandler } from './study-note.handler';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  providers: [StudyNoteService],
  controllers: [StudyNoteHandler],
})
export class StudyNoteModule {}
