import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { FlashcardController } from "./flashcard.controller";

@Module({
    imports: [NatsClientModule],
    controllers: [FlashcardController],
    exports: [],
})
export class FlashcardModule {
}
