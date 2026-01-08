# Software Requirements Specification (SRS)
## Section 8: API Specifications

---

## 8.1 API Overview

**Base URL:** `https://api.torii-nihongo.com/api/v1`

**Authentication:** JWT Bearer token

**Content-Type:** `application/json`

**Response Format:** JSON

---

## 8.2 Authentication Endpoints

### POST /auth/register

**Description:** Register new user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "displayName": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "displayName": "John Doe",
  "message": "Verification email sent"
}
```

**Errors:**
- `400 Bad Request` - Validation error
- `409 Conflict` - Email already exists

---

### POST /auth/login

**Description:** Login user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "learner"
  }
}
```

**Errors:**
- `401 Unauthorized` - Invalid credentials
- `403 Forbidden` - Account not verified/banned

---

### POST /auth/refresh

**Description:** Refresh access token

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "new_jwt_token"
}
```

---

## 8.3 Course Endpoints

### GET /courses

**Description:** Get course list

**Query Parameters:**
- `jlptLevel` - Filter by JLPT level (N5, N4, N3, N2, N1)
- `type` - Filter by type (vod, live)
- `status` - Filter by status (published, draft)
- `search` - Search by title
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Course Title",
      "slug": "course-slug",
      "description": "Course description",
      "jlptLevel": "N5",
      "price": 500000,
      "discountPrice": 400000,
      "thumbnailUrl": "https://...",
      "averageRating": 4.5,
      "totalReviews": 120,
      "totalStudents": 1000
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

### GET /courses/:id

**Description:** Get course details

**Response (200 OK):**
```json
{
  "id": "uuid",
  "title": "Course Title",
  "description": "Full description",
  "modules": [
    {
      "id": "uuid",
      "title": "Module Title",
      "lessons": [
        {
          "id": "uuid",
          "title": "Lesson Title",
          "contentType": "video",
          "videoDuration": 600,
          "isPreview": false
        }
      ]
    }
  ],
  "instructors": [
    {
      "id": "uuid",
      "displayName": "Instructor Name",
      "avatarUrl": "https://..."
    }
  ],
  "price": 500000,
  "isEnrolled": false
}
```

---

### POST /courses/:id/enroll

**Description:** Enroll in course

**Request Body:**
```json
{
  "couponCode": "SUMMER2024" // optional
}
```

**Response (201 Created):**
```json
{
  "enrollmentId": "uuid",
  "paymentUrl": "https://payment-gateway.com/...", // if payment required
  "message": "Enrollment successful" // if free course
}
```

**Errors:**
- `400 Bad Request` - Already enrolled
- `402 Payment Required` - Payment needed
- `404 Not Found` - Course not found

---

## 8.4 Live Class Endpoints

### GET /live-classes

**Description:** Get live class list

**Query Parameters:**
- `status` - Filter by status (scheduled, live, ended)
- `lecturerId` - Filter by lecturer
- `startTime` - Filter by start time range

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Live Class Title",
      "startTime": "2024-12-28T10:00:00Z",
      "durationMinutes": 60,
      "maxStudents": 50,
      "currentStudents": 30,
      "lecturer": {
        "id": "uuid",
        "displayName": "Lecturer Name"
      },
      "status": "scheduled"
    }
  ]
}
```

---

### POST /live-classes/:id/join

**Description:** Join live class

**Response (200 OK):**
```json
{
  "joinUrl": "https://livekit.io/room/...",
  "token": "livekit_token",
  "roomId": "room_id"
}
```

**Errors:**
- `403 Forbidden` - Not enrolled
- `404 Not Found` - Live class not found
- `409 Conflict` - Class full or not started

---

## 8.5 Quiz Endpoints

### GET /quizzes

**Description:** Get quiz list

**Query Parameters:**
- `quizType` - Filter by type (practice, jlpt_mock)
- `jlptLevel` - Filter by JLPT level
- `status` - Filter by status (published)

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Quiz Title",
      "quizType": "practice",
      "jlptLevel": "N5",
      "timeLimitMinutes": 30,
      "totalQuestions": 20,
      "maxAttempts": 3
    }
  ]
}
```

---

### POST /quizzes/:id/attempts

**Description:** Start quiz attempt

**Response (201 Created):**
```json
{
  "attemptId": "uuid",
  "quizId": "uuid",
  "startedAt": "2024-12-28T10:00:00Z",
  "timeRemaining": 1800,
  "questions": [
    {
      "id": "uuid",
      "questionText": "Question text",
      "options": {
        "A": "Option A",
        "B": "Option B"
      },
      "points": 1.0
    }
  ]
}
```

**Errors:**
- `400 Bad Request` - Max attempts reached
- `404 Not Found` - Quiz not found

---

### POST /quizzes/:id/attempts/:attemptId/submit

**Description:** Submit quiz attempt

**Request Body:**
```json
{
  "answers": {
    "questionId1": "A",
    "questionId2": "B"
  }
}
```

**Response (200 OK):**
```json
{
  "attemptId": "uuid",
  "score": 85.5,
  "maxScore": 100.0,
  "percentage": 85.5,
  "isPassed": true,
  "timeTakenSeconds": 1200,
  "details": [
    {
      "questionId": "uuid",
      "userAnswer": "A",
      "correctAnswer": "A",
      "isCorrect": true,
      "pointsEarned": 1.0,
      "explanation": "Explanation text"
    }
  ]
}
```

---

## 8.6 Payment Endpoints

### POST /payments

**Description:** Create payment

**Request Body:**
```json
{
  "enrollmentId": "uuid",
  "amount": 500000,
  "paymentMethod": "vnpay",
  "couponCode": "SUMMER2024" // optional
}
```

**Response (201 Created):**
```json
{
  "paymentId": "uuid",
  "paymentUrl": "https://vnpay.vn/...",
  "amount": 500000,
  "status": "pending"
}
```

---

### GET /payments/:id

**Description:** Get payment status

**Response (200 OK):**
```json
{
  "id": "uuid",
  "amount": 500000,
  "status": "completed",
  "paymentMethod": "vnpay",
  "transactionId": "txn_123",
  "completedAt": "2024-12-28T10:00:00Z"
}
```

---

## 8.7 Error Response Format

**Standard Error Response:**
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request",
  "details": {
    "field": "Error detail for specific field"
  }
}
```

**HTTP Status Codes:**
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict
- `422 Unprocessable Entity` - Business logic error
- `500 Internal Server Error` - Server error

---

## 8.8 Rate Limiting

**Rate Limits:**
- **General API:** 100 requests/minute per IP
- **Authentication:** 5 requests/minute per IP
- **Payment:** 10 requests/minute per user

**Response Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1703760000
```

**Rate Limit Exceeded (429 Too Many Requests):**
```json
{
  "statusCode": 429,
  "message": "Rate limit exceeded",
  "retryAfter": 60
}
```

---

**Next Section:** [Section 9: Acceptance Criteria](srs-08-acceptance-criteria.md)


