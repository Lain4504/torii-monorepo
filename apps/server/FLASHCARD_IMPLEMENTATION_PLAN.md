# Flashcard & Note Implementation Plan

## 1. Schema Updates (`schema.prisma`)
**Delete legacy models and enums:**
- Enums: `FlashcardState`, `FlashcardGenerationMethod`, `JapanesePartOfSpeech` (if unused elsewhere), `ReviewQuality`.
- Models: `Note`, `FlashcardDeck`, `Flashcard`, `FlashcardUserProgress`, `FlashcardReview`, `FlashcardReviewSession`.

**Add new models per specs:**
- Enum `SrsState`: `NEW`, `LEARNING`, `REVIEW`, `MASTERED`.
- Model `Note`:
  - Fields: id, userId, content, lessonId, tags, metadata, createdAt, updatedAt.
- Model `FlashcardDeck`:
  - Fields: id, userId, title, description, subject, isPublic, settings, stats, createdAt, updatedAt.
- Model `Flashcard`:
  - Fields: id, deckId, noteId, term, definition, hint, mediaUrl, languageDetails, tags, srsState, nextReviewAt, interval, easeFactor, createdAt, updatedAt.

## 2. Generate Prisma Client
- Run `npx prisma db push --accept-data-loss` to drop old data and create the new schema.
- Run `npx prisma generate` to update the client.

## 3. Implement Note Module in `academy` Service
- `NoteController` & `NoteService`
- Endpoints:
  - `POST /notes`: Create a new note.
  - `GET /notes`: List notes (filter by lesson, tags).
  - `POST /notes/:id/to-flashcard`: Convert a note to a Flashcard (Draft).

## 4. Implement Flashcard Module in `academy` Service
- `FlashcardController` & `FlashcardService`
- Endpoints:
  - `POST /decks`: Create a new deck.
  - `POST /decks/:id/cards`: Add a card to a deck.
  - `GET /decks/:id/study`: Get today's study list (`nextReviewAt <= now OR srsState = 'NEW'`).
  - `POST /cards/:id/review`: Submit review result (`quality: 0 | 1`).
    - Logic: Update `interval`, `easeFactor`, `srsState`, `nextReviewAt` using Leitner/SM-2-like calculations based on Quizlet logic from the spec.

## 5. Implement Flashcard & Note in API Gateway
- Route all `/flashcards`, `/decks`, `/notes` requests to the `academy` microservice.

I will proceed to execute these steps!
