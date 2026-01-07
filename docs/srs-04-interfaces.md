# Software Requirements Specification (SRS)
## Section 4: External Interface Requirements

---

## 4.1 User Interfaces

### 4.1.1 Web Admin Dashboard

**Technology:** React + Vite + TypeScript

**Target Users:** Staff và Admin

**Key Features:**
- Responsive design (Desktop-first)
- Dark/Light theme support
- Real-time updates
- Data tables với pagination, sorting, filtering
- Form validation
- File upload
- Charts và analytics dashboards

**Main Screens:**
1. **Dashboard:** System statistics, charts, recent activities
2. **Users Management:** User list, create/edit user, role management
3. **Courses Management:** Course list, create/edit course, module/lesson management
4. **Live Classes:** Live class scheduling, monitoring
5. **Question Bank:** Question management, bulk import
6. **Quizzes:** Quiz creation, question assignment
7. **Payments:** Payment history, transaction management
8. **Coupons:** Coupon creation và management
9. **Blog:** Blog post management
10. **Analytics:** Learning analytics, revenue reports

**UI Components:**
- shadcn/ui component library
- Tailwind CSS for styling
- React Query for data fetching
- React Hook Form for forms

**Accessibility:**
- WCAG 2.1 Level AA compliance
- Keyboard navigation
- Screen reader support
- High contrast mode

---

### 4.1.2 Web Learner Platform

**Technology:** Next.js 14 + TypeScript + React

**Target Users:** Learners

**Key Features:**
- Server-side rendering (SSR)
- Responsive design (Mobile-first)
- Progressive Web App (PWA) capabilities
- Offline support for downloaded content
- Video player với progress tracking
- Interactive quizzes
- Flashcard study interface
- Live class interface

**Main Screens:**
1. **Home:** Course catalog, featured courses, recommendations
2. **Course Detail:** Course information, preview, enrollment
3. **My Courses:** Enrolled courses, progress tracking
4. **Course Player:** Video player, lesson navigation, notes
5. **Live Classes:** Schedule, join live sessions
6. **Quizzes:** Available quizzes, take quiz, view results
7. **Flashcards:** Decks, study interface
8. **Assignments:** Assignment list, submit assignments
9. **Profile:** User profile, settings, achievements
10. **Notifications:** Notification center

**UI Components:**
- shadcn/ui component library
- Tailwind CSS for styling
- Next.js Image optimization
- Video.js or similar for video playback

**Accessibility:**
- WCAG 2.1 Level AA compliance
- Mobile-optimized
- Touch-friendly interface
- Responsive video player

---

### 4.1.3 Mobile Web (Responsive)

**Technology:** Same as Web Learner Platform (Next.js responsive)

**Target Users:** Learners on mobile devices

**Key Features:**
- Mobile-optimized layouts
- Touch gestures
- Swipe navigation
- Mobile-friendly video player
- Push notifications (via PWA)

**Responsive Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 4.2 Hardware Interfaces

### 4.2.1 Server Hardware

**Minimum Requirements:**
- CPU: 4 cores per service
- RAM: 8GB per service
- Storage: 100GB SSD (database), 500GB+ (file storage)
- Network: 1Gbps

**Recommended (Production):**
- CPU: 8+ cores per service
- RAM: 16GB+ per service
- Storage: SSD with high IOPS
- Network: 10Gbps

### 4.2.2 Client Hardware

**Minimum:**
- CPU: Dual-core processor
- RAM: 2GB
- Network: 3G connection (384 kbps)
- Browser: Modern browser (Chrome 100+, Firefox 100+, Safari 15+)

**Recommended:**
- CPU: Quad-core processor
- RAM: 4GB+
- Network: 4G/WiFi (5+ Mbps)
- Browser: Latest version

**For Live Classes:**
- Stable internet connection (2+ Mbps upload)
- Webcam và microphone (optional)
- Headphones (recommended)

---

## 4.3 Software Interfaces

### 4.3.1 LiveKit Integration

**Purpose:** WebRTC infrastructure cho live classes

**Interface Type:** HTTP REST API + WebRTC

**Authentication:** JWT tokens via NATS auth callout

**Key Operations:**
- Create room
- Generate access token
- Start/stop recording
- Get room participants
- Room analytics

**Configuration:**
- API Key và Secret
- Server URL
- Region settings

**Documentation:** https://docs.livekit.io/

---

### 4.3.2 Payment Gateway Interfaces

#### VNPay
**Protocol:** HTTP REST API + Webhooks
**Authentication:** API Key, Checksum
**Operations:**
- Create payment URL
- Payment status check
- Refund processing
**Documentation:** VNPay API documentation

#### MoMo
**Protocol:** HTTP REST API + Webhooks
**Authentication:** API Key, Signature
**Operations:**
- Create payment request
- Payment status check
- Refund processing
**Documentation:** MoMo API documentation

#### ZaloPay
**Protocol:** HTTP REST API + Webhooks
**Authentication:** App ID, App User, Mac
**Operations:**
- Create order
- Payment status check
- Refund processing
**Documentation:** ZaloPay API documentation

**Common Requirements:**
- HTTPS only
- Webhook signature verification
- Idempotency handling
- Error handling và retry logic

---

### 4.3.3 OAuth Provider Interfaces

#### Google OAuth 2.0
**Protocol:** OAuth 2.0, OpenID Connect
**Authentication:** Client ID, Client Secret
**Operations:**
- Authorization code flow
- Token exchange
- User info retrieval
**Scopes:**
- `openid`
- `profile`
- `email`

**Documentation:** https://developers.google.com/identity/protocols/oauth2

---

### 4.3.4 Email Service Interface

**Protocol:** SMTP/TLS

**Configuration:**
- SMTP server host
- Port: 587 (TLS) or 465 (SSL)
- Username và password
- From address

**Operations:**
- Send email (HTML/Text)
- Email templates
- Attachment support

**Email Types:**
- Account verification
- Password reset
- Course enrollment confirmation
- Live class reminders
- Assignment notifications
- Payment receipts

**Service Options:**
- SMTP server (self-hosted)
- SendGrid, Mailgun, AWS SES (cloud)

---

### 4.3.5 File Storage Interface

**Protocol:** S3-compatible API

**Service Options:**
- MinIO (development)
- AWS S3 (production)
- Other S3-compatible storage

**Operations:**
- Upload file
- Download file
- Delete file
- Generate presigned URL
- List objects

**Configuration:**
- Endpoint URL
- Access Key ID
- Secret Access Key
- Bucket name
- Region

**File Types:**
- Course videos
- Course materials (PDF, DOCX, PPTX)
- User avatars
- Blog images
- Assignment submissions

---

### 4.3.6 AI Services Interface (FastMCP)

**Protocol:** FastMCP protocol

**Agents:**
1. **Sensei Agent:**
   - Grammar assistance
   - Translation (Japanese ↔ Vietnamese/English)
   - Flashcard generation

2. **Assessment Agent:**
   - Test question generation
   - Answer evaluation
   - Difficulty assessment

3. **Analytics Agent:**
   - Learning progress analysis
   - Weak area identification
   - Personalized recommendations

**Interface:**
- HTTP REST API
- FastMCP protocol messages
- Streaming responses (optional)

**Authentication:** API Key hoặc JWT

---

## 4.4 Communication Interfaces

### 4.4.1 REST API

**Protocol:** HTTP/HTTPS

**Base URL:** `https://api.torii-nihongo.com/api`

**Authentication:**
- JWT Bearer token
- Token in `Authorization` header: `Bearer <token>`

**Request Format:**
- Method: GET, POST, PUT, PATCH, DELETE
- Headers: `Content-Type: application/json`
- Body: JSON (for POST/PUT/PATCH)

**Response Format:**
- Success: `200 OK` với JSON body
- Error: `4xx/5xx` với error JSON:
  ```json
  {
    "statusCode": 400,
    "message": "Error message",
    "error": "Bad Request"
  }
  ```

**Pagination:**
- Query params: `page`, `limit`
- Response headers: `X-Total-Count`, `X-Page`, `X-Per-Page`

**Rate Limiting:**
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

**Versioning:**
- URL versioning: `/api/v1/...`
- Header versioning: `Accept: application/vnd.torii.v1+json`

---

### 4.4.2 WebSocket Protocol

**Purpose:** Real-time communication cho live classes

**Protocol:** WebSocket over HTTPS (WSS)

**Connection:**
- URL: `wss://api.torii-nihongo.com/ws`
- Authentication: JWT token in query param hoặc header

**Message Format:**
```json
{
  "type": "message_type",
  "payload": { ... },
  "timestamp": "2024-12-28T10:00:00Z"
}
```

**Message Types:**
- `ping` / `pong` - Keep-alive
- `join_room` - Join live class room
- `leave_room` - Leave room
- `chat_message` - Send chat message
- `raise_hand` - Raise hand in class
- `whiteboard_update` - Whiteboard changes
- `screen_share` - Screen sharing events

**Error Handling:**
- Connection errors: Reconnect với exponential backoff
- Message errors: Error response message

---

### 4.4.3 NATS Message Patterns

**Purpose:** Inter-service communication, real-time events

**Protocol:** NATS JetStream

**Patterns:**

1. **Request/Response:**
   - Subject: `service.action.request`
   - Response: `service.action.response`

2. **Publish/Subscribe:**
   - Subject: `events.*`
   - Consumers subscribe to event streams

3. **Queue Groups:**
   - Load balancing across service instances

**Key Subjects:**
- `auth.callout.request` - LiveKit auth callout
- `events.payment.completed` - Payment completed event
- `events.enrollment.created` - Enrollment created event
- `events.live_class.started` - Live class started
- `events.quiz.submitted` - Quiz submitted

**Message Format:**
```json
{
  "id": "uuid",
  "type": "event_type",
  "data": { ... },
  "timestamp": "2024-12-28T10:00:00Z",
  "source": "service_name"
}
```

---

### 4.4.4 Webhook Interfaces

**Purpose:** Receive events from external services

**Endpoints:**
- `/webhooks/payments/vnpay`
- `/webhooks/payments/momo`
- `/webhooks/payments/zalopay`

**Authentication:**
- Signature verification
- IP whitelist (if supported)

**Payload Format:**
- Service-specific format
- Standardized internal format after processing

**Retry Logic:**
- Exponential backoff
- Maximum retries: 3
- Dead letter queue for failed webhooks

---

**Next Section:** [Section 5: System Features](srs-05-system-features.md)


