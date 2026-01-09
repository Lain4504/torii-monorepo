# Quiz và Question Pool - Thiết Kế

## Tổng Quan

Document này giải thích thiết kế cho việc tích hợp Question Pool vào Quiz system, cho phép Staff quản lý question banks hiệu quả hơn và tạo quizzes/exams từ pools.

## Thiết Kế

### 1. Section Configuration Schema

Mỗi section trong Quiz **PHẢI** có một trong hai cách chọn questions:

```typescript
{
  type: "vocab" | "grammar" | "reading" | "listening",
  timeLimit: number, // minutes
  questionCount: number,
  questionIds?: string[],      // Option 1: Specific questions (if provided, poolId is ignored)
  poolId?: string,             // Option 2: Select from pool (required if questionIds not provided)
}
```

**Validation:** Mỗi section phải có ít nhất một trong hai: `questionIds` hoặc `poolId`

### 2. Question Selection Logic

`generateExamQuestions()` sẽ chọn questions theo thứ tự:

1. **Option 1: Specific Questions** (`questionIds`)
   - Nếu `questionIds` được cung cấp, lấy chính xác những questions đó
   - Hữu ích cho fixed exams hoặc practice tests với questions cụ thể
   - `poolId` sẽ bị ignore nếu `questionIds` được cung cấp

2. **Option 2: Pool-based Selection** (`poolId`)
   - Nếu `poolId` được cung cấp (và không có `questionIds`), lấy questions từ pool đó
   - Random selection từ pool với ưu tiên questions ít được dùng (`usageCount`)
   - Hữu ích cho JLPT mock exams hoặc practice tests từ curated pools

3. **Error nếu thiếu cả hai:**
   - Nếu section không có `questionIds` và không có `poolId`, sẽ throw `BadRequestException`

### 3. Use Cases

#### Use Case 1: JLPT Mock Exam từ Pool
```json
{
  "title": "JLPT N3 Mock Exam",
  "quizType": "jlpt_mock",
  "jlptLevel": "N3",
  "sections": [
    {
      "type": "vocab",
      "timeLimit": 30,
      "questionCount": 15,
      "poolId": "vocab-n3-pool-id"  // Select from vocab pool
    },
    {
      "type": "grammar",
      "timeLimit": 40,
      "questionCount": 20,
      "poolId": "grammar-n3-pool-id"  // Select from grammar pool
    },
    {
      "type": "reading",
      "timeLimit": 50,
      "questionCount": 10,
      "poolId": "reading-n3-pool-id"  // Select from reading pool
    },
    {
      "type": "listening",
      "timeLimit": 40,
      "questionCount": 15,
      "poolId": "listening-n3-pool-id"  // Select from listening pool
    }
  ]
}
```

#### Use Case 2: Practice Test với Questions Cụ Thể
```json
{
  "title": "Practice Test - Lesson 5",
  "quizType": "practice",
  "sections": [
    {
      "type": "vocab",
      "timeLimit": 20,
      "questionCount": 10,
      "questionIds": ["q1", "q2", "q3", ...]  // Fixed questions
    }
  ]
}
```

#### Use Case 3: Course Quiz từ Pool
```json
{
  "title": "Module 1 Quiz",
  "quizType": "module",
  "courseId": "course-id",
  "jlptLevel": "N5",
  "sections": [
    {
      "type": "vocab",
      "timeLimit": 15,
      "questionCount": 10,
      "poolId": "module-1-vocab-pool-id"  // Required: select from pool
    }
  ]
}
```

## Implementation Requirements

### Schema Requirements

**Schema hiện tại đã đủ:**
- `QuestionPool` đã có trong schema
- `Question.poolId` đã có (nullable)
- `Quiz.sections` là JSON field, có thể mở rộng mà không cần migration

### Validation Rules

1. **Section Validation:**
   - Mỗi section phải có ít nhất một trong hai: `questionIds` hoặc `poolId`
   - Nếu có `questionIds`, `poolId` sẽ bị ignore
   - Nếu không có cả hai, sẽ throw `BadRequestException`

2. **Question Selection:**
   - Nếu `questionIds` được cung cấp, phải đảm bảo tất cả questions tồn tại và active
   - Nếu `poolId` được cung cấp, phải đảm bảo pool có đủ questions (có warning nếu không đủ)

### Required Steps

1. **Tạo Question Pools**
   - Staff tạo pools cho các categories và JLPT levels
   - Assign questions vào pools

2. **Tạo Quizzes với Pools hoặc QuestionIds**
   - Mỗi section phải có `poolId` hoặc `questionIds`
   - Không còn fallback về category/jlptLevel

## Benefits

1. **Better Question Management**
   - Staff có thể tổ chức questions vào pools theo topic, difficulty, hoặc course
   - Dễ dàng maintain và update questions trong pools

2. **Flexible Quiz Creation**
   - Có thể tạo quiz từ pools (random selection)
   - Có thể tạo quiz với questions cụ thể (fixed)
   - Rõ ràng và explicit về nguồn questions

3. **JLPT Mock Exam Support**
   - Dễ dàng tạo mock exams từ curated pools
   - Mỗi section có thể reference pool riêng

4. **Question Usage Tracking**
   - Questions được chọn từ pool sẽ ưu tiên những questions ít được dùng
   - Giúp distribute questions evenly

## API Changes

### Breaking Changes

- **Quizzes phải có `poolId` hoặc `questionIds` trong mỗi section**
- Không còn fallback về category/jlptLevel
- Existing quizzes không có `poolId` hoặc `questionIds` sẽ fail khi generate questions

### New Capabilities

- Staff có thể tạo quiz với `poolId` trong sections
- System tự động chọn questions từ pool khi generate exam
- Validation rõ ràng về requirements

## Testing Recommendations

1. **Test Pool-based Selection**
   - Tạo quiz với `poolId` trong sections
   - Verify questions được chọn từ pool đúng
   - Verify random selection và usage count priority
   - Test warning khi pool không đủ questions

2. **Test QuestionIds Selection**
   - Tạo quiz với `questionIds` trong sections
   - Verify questions được chọn đúng
   - Test warning khi questions không đủ

3. **Test Validation**
   - Test error khi section không có `poolId` và `questionIds`
   - Test `questionIds` có priority cao hơn `poolId`

4. **Test Edge Cases**
   - Pool không có questions
   - QuestionIds có questions không tồn tại
   - QuestionIds có questions inactive

## Conclusion

Thiết kế này **KHÔNG CẦN REBUILD DATABASE** vì:
- Schema đã đủ (QuestionPool, Question.poolId đã có)
- Quiz.sections là JSON field, có thể mở rộng

**Lưu ý:**
- **Breaking change:** Existing quizzes không có `poolId` hoặc `questionIds` sẽ cần được update
- Mỗi section phải có ít nhất một trong hai: `poolId` hoặc `questionIds`
- Validation được thực hiện ở cả schema level (Zod) và service level

