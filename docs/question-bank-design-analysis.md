# Question Bank Design Analysis & Recommendations

## Current Design Assessment

### ✅ Strengths
1. **Simple & Flat Structure**: Easy to query, no complex joins
2. **Flexible Tags**: Array-based tags for flexible categorization
3. **Good Indexing**: Indexes on questionType, jlptLevel, difficulty, status
4. **Scalable for Small-Medium**: Works well for < 10,000 questions
5. **JSONB Options**: Flexible for different question types

### ⚠️ Potential Issues

#### 1. Category/Subcategory as Free Text
**Problem:**
- No validation → typos: "vocab" vs "vocabulary" vs "từ vựng"
- No standardization → hard to filter/group
- No hierarchy management

**Impact:**
- Inconsistent data
- Hard to generate statistics
- Difficult to maintain taxonomy

#### 2. Missing Index on Category
**Problem:**
- No index on `category` field
- Slow queries when filtering by category

**Impact:**
- Performance issues when filtering by category
- Common use case: "Get all vocab questions"

#### 3. No Question Pool/Group Management
**Problem:**
- All questions in one flat table
- No way to group questions for specific purposes
- Hard to manage question sets

**Impact:**
- Difficult to create question sets for specific courses
- No way to organize questions by topic groups

## Recommendations

### Option 1: Keep Current Design + Minor Improvements (Recommended for MVP)

**Changes:**
1. ✅ Add index on category
2. ✅ Add validation enum for category values
3. ✅ Add validation in service layer

**Pros:**
- Minimal changes
- Fast to implement
- Good enough for MVP

**Cons:**
- Still no taxonomy management
- Manual category management

### Option 2: Add Category Taxonomy Table (For Scale)

**New Table:**
```sql
CREATE TABLE question_categories (
    id UUID PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    parent_id UUID REFERENCES question_categories(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Changes:**
- Add `category_id` FK to question_bank
- Remove `category` string field
- Add category management endpoints

**Pros:**
- Standardized categories
- Hierarchy support (parent/child)
- Better statistics
- Easier management

**Cons:**
- More complex
- Requires migration
- More code to maintain

### Option 3: Hybrid Approach (Best for Production)

**Keep:**
- Current flat structure
- Tags for flexible categorization
- Category as string (for backward compatibility)

**Add:**
- Category validation enum in code
- Index on category
- Optional category taxonomy table (for future)

**Implementation:**
```typescript
// Validation enum
export enum QuestionCategory {
    VOCAB = 'vocab',
    GRAMMAR = 'grammar',
    READING = 'reading',
    LISTENING = 'listening',
}

// Service validation
if (dto.category && !Object.values(QuestionCategory).includes(dto.category)) {
    throw new BadRequestException('Invalid category');
}
```

## Recommended Actions

### Immediate (MVP):
1. ✅ Add index on category field
2. ✅ Add category validation enum
3. ✅ Add validation in service layer
4. ✅ Add index on createdBy (for "my questions" queries)

### Future (Scale):
1. Consider category taxonomy table if > 10,000 questions
2. Add question pools/groups if needed
3. Add question versioning if questions change over time
4. Add question metadata (images, audio) if needed

## Conclusion

**Current design is GOOD for MVP** ✅
- Simple and effective
- Easy to query and maintain
- Good performance with proper indexes

**Needs minor improvements:**
- Add category index
- Add category validation
- Consider taxonomy table for future scale

