# Use Case Specifications: Flashcards & Community

**Project:** Torii Nihongo Learning Platform  
**Module:** Flashcards, Community & Content  
**Use Cases:** UC-023 to UC-027  
**Version:** 1.0  
**Date:** January 2026

---

## Table of Contents

1. [UC-023: Manage Flashcards](#uc-023-manage-flashcards)
2. [UC-024: View Post List](#uc-024-view-post-list)
3. [UC-025: View Post Detail](#uc-025-view-post-detail)
4. [UC-026: Search Post](#uc-026-search-post)
5. [UC-027: Consult with AI](#uc-027-consult-with-ai)

---

## UC-023: Manage Flashcards

### Primary Actor
- Learner

### Secondary Actor
- AI Service (for auto-generation)

### Description
As a learner, I want to create, view, update, and delete flashcards so that I can practice vocabulary and grammar using spaced repetition.

### Trigger
**Navigation path:** Dashboard → Flashcards

**Direct trigger:** User clicks "Flashcards" or "Create Flashcard"

### Pre-condition
- User is logged in

### Post-condition
- **Create:** New flashcard is created
- **View:** Flashcards are displayed
- **Update:** Flashcard is updated
- **Delete:** Flashcard is deleted

### Validation Rules
- **VR-CARD-001:** Front text is required
- **VR-CARD-002:** Back text is required
- **VR-CARD-003:** Furigana format validation (if provided)

### Business Rules
- **BR-CARD-001:** Front text and back text are required
- **BR-CARD-002:** Generation methods: manual, ai_auto, ai_assisted, import
- **BR-SRS-001:** Card states: new, learning, review, relearning

### Normal Flow (Create Flashcard)
1. User clicks "Create Flashcard"
2. System displays create form with:
   - Deck selection dropdown
   - Front text (Japanese)
   - Back text (English/Vietnamese)
   - Furigana (optional)
   - Part of speech (optional)
   - Example sentence (optional)
   - Tags (optional)
3. User fills in flashcard data
4. User clicks "Create"
5. System validates input
6. System creates flashcard with:
   - generationMethod = 'manual'
   - state = 'new'
   - easeFactor = 2.5
7. System displays success message
8. System adds card to selected deck

### Normal Flow (View Flashcards)
1. User navigates to Flashcards
2. System displays deck list with:
   - Deck name
   - Number of cards
   - Cards due for review
   - "Study Now" button
3. User selects a deck
4. System displays flashcard list with:
   - Front text
   - Tags
   - State (new, learning, review)
   - Next review date
   - Edit/Delete buttons
5. System displays filters:
   - All Cards
   - New
   - Learning
   - Review
6. System displays "Study Now" button

### Normal Flow (Update Flashcard)
1. User clicks "Edit" on flashcard
2. System displays edit form with current values
3. User modifies flashcard data
4. User clicks "Save"
5. System validates input
6. System updates flashcard
7. System displays success message

### Normal Flow (Delete Flashcard)
1. User clicks "Delete" on flashcard
2. System displays confirmation dialog
3. User confirms deletion
4. System deletes flashcard
5. System displays success message

### Alternative Flows

**Alternative Flow A: AI-Assisted Generation**
- User clicks "Generate with AI"
- User provides Japanese text or document
- System sends to AI service
- AI generates flashcards with:
  - Front: Japanese word/phrase
  - Back: Translation
  - Furigana
  - Part of speech
  - Example sentence
- System displays generated cards for review
- User can edit before saving

**Alternative Flow B: Import from File**
- User clicks "Import"
- User uploads CSV/Excel file
- System parses file
- System validates data
- System creates flashcards in bulk
- System displays import summary

**Alternative Flow C: Study Session**
- User clicks "Study Now"
- System retrieves due cards (SRS algorithm)
- System displays card front
- User thinks of answer
- User clicks "Show Answer"
- System displays card back
- User rates difficulty (Again, Hard, Good, Easy)
- System updates card state and next review date
- System shows next card
- Repeat until session complete

---

## UC-024: View Post List

### Primary Actor
- Learner (Guest users can also view)

### Secondary Actor
- None

### Description
As a user, I want to view blog posts so that I can read learning tips and news.

### Trigger
**Navigation path:** Home → Blog

**Direct trigger:** User clicks "Blog" in navigation

### Pre-condition
- None (public page)

### Post-condition
- Blog post list is displayed

### Validation Rules
- None

### Business Rules
- **BR-POST-002:** Post status: draft, published, archived

### Normal Flow
1. User navigates to Blog
2. System retrieves published posts
3. System displays post cards with:
   - Featured image
   - Title
   - Excerpt
   - Author name and avatar
   - Published date
   - Read time estimate
   - Tags
   - View count
   - Like count
4. System displays pagination
5. System displays filters:
   - All Posts
   - By Category
   - By Tag
6. System displays sort options:
   - Latest
   - Most Popular
   - Most Liked

### Alternative Flows

**Alternative Flow A: No Posts**
- System displays empty state
- "Check back soon" message

**Alternative Flow B: Filter by Category**
- User selects category
- System filters posts
- System updates URL

---

## UC-025: View Post Detail

### Primary Actor
- Learner (Guest users can also view)

### Secondary Actor
- None

### Description
As a user, I want to read blog post details so that I can learn from the content.

### Trigger
**Navigation path:** Blog → Post

**Direct trigger:** User clicks on post card

### Pre-condition
- Post is published

### Post-condition
- Post detail is displayed
- View count is incremented

### Validation Rules
- None

### Business Rules
- **BR-POST-005:** View count tracked automatically

### Normal Flow
1. User clicks on post
2. System retrieves post data
3. System increments view count
4. System displays post with:
   - Title
   - Author info
   - Published date
   - Content (rich text)
   - Images/videos
   - Tags
5. System displays related posts
6. System displays comments section
7. System displays "Like" button
8. System displays social share buttons

### Alternative Flows

**Alternative Flow A: Post Not Found**
- System displays 404 error

**Alternative Flow B: Like Post**
- User clicks "Like"
- System increments like count
- System saves user's like

---

## UC-026: Search Post

### Primary Actor
- Learner (Guest users can also search)

### Secondary Actor
- None

### Description
As a user, I want to search blog posts so that I can find specific content.

### Trigger
**Navigation path:** Blog → Search

**Direct trigger:** User types in search bar

### Pre-condition
- None

### Post-condition
- Search results are displayed

### Validation Rules
- **VR-SEARCH-001:** Search query min 2 characters

### Business Rules
- None specific

### Normal Flow
1. User types search query
2. User presses Enter
3. System performs full-text search in:
   - Post title
   - Post content
   - Tags
4. System displays search results
5. System highlights search terms

### Alternative Flows

**Alternative Flow A: No Results**
- System displays "No posts found"

---

## UC-027: Consult with AI

### Primary Actor
- Learner

### Secondary Actor
- AI Service (FastMCP/Gemini)

### Description
As a learner, I want to consult with AI for grammar checking and translation help so that I can improve my Japanese.

### Trigger
**Navigation path:** Dashboard → AI Assistant

**Direct trigger:** User clicks "AI Assistant" or types question

### Pre-condition
- User is logged in

### Post-condition
- AI response is displayed

### Validation Rules
- **VR-AI-001:** Question is required, max 500 characters

### Business Rules
- Rate limiting: 100 requests per minute per user

### Normal Flow
1. User navigates to AI Assistant
2. System displays chat interface
3. User types question or Japanese text
4. User selects AI action:
   - Grammar Check
   - Translation
   - Explanation
   - Example Sentences
5. User clicks "Send"
6. System sends request to AI service
7. AI processes request
8. System displays AI response with:
   - Corrections (if grammar check)
   - Translation (if translation)
   - Explanation
   - Confidence score
9. User can ask follow-up questions

### Alternative Flows

**Alternative Flow A: Rate Limit Exceeded**
- System displays "Too many requests. Please try again later."

**Alternative Flow B: AI Service Error**
- System displays "AI service temporarily unavailable"
- Suggest trying again later

---

**Last Updated:** 2026-01-12  
**Version:** 1.0  
**Status:** ✅ Complete
