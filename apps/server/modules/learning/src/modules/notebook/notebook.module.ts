import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';
import { NotebookService } from '@server/learning/modules/notebook/notebook.service';
import { NotebookRepository } from '@server/learning/modules/notebook/notebook.repository';
import { NOTEBOOK_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories/i-notebook.repository';
import { NOTEBOOK_SERVICE_TOKEN } from '@server/learning/interfaces/services/i-notebook.service';

@Module({
    imports: [SharedModule],
    providers: [
        {
            provide: NOTEBOOK_REPOSITORY_TOKEN,
            useClass: NotebookRepository,
        },
        {
            provide: NOTEBOOK_SERVICE_TOKEN,
            useClass: NotebookService,
        },
    ],
    exports: [NOTEBOOK_SERVICE_TOKEN, NOTEBOOK_REPOSITORY_TOKEN],
})
export class NotebookModule { }
