# External Interfaces Requirements

**Project:** Torii Nihongo Learning Platform  
**Project Code:** SP26SE005  
**Version:** 1.0  
**Date:** January 2026

---

## 📋 Table of Contents

1. [User Interfaces](#1-user-interfaces)
2. [Hardware Interfaces](#2-hardware-interfaces)
3. [Software Interfaces](#3-software-interfaces)
4. [Communication Interfaces](#4-communication-interfaces)

---

## 1. User Interfaces

This section describes all user interfaces for the Torii Nihongo Learning Platform.

### 1.1 Web Admin Dashboard (React + Vite)

**Purpose:** Administrative interface for Admin, Staff, and Lecturer roles

**Technology Stack:**
- Framework: React 18+
- Build Tool: Vite 5+
- UI Library: shadcn/ui (Radix UI + Tailwind CSS)
- State Management: React Query + Zustand
- Routing: React Router v6
- Forms: React Hook Form + Zod validation

**Screen Resolution:**
- Minimum: 1280x720 (HD)
- Recommended: 1920x1080 (Full HD)
- Supported: Up to 4K (3840x2160)

**Browser Support:**
- Chrome 90+ (Primary)
- Firefox 88+
- Safari 14+
- Edge 90+

**Key Features:**
- Dashboard with analytics and charts
- Course management (CRUD operations)
- User management and RBAC
- Payment and enrollment tracking
- Live class scheduling
- Question bank and quiz builder
- Content management (blog posts)
- File upload and media library
- System configuration
- Audit logs viewer

**UI Components:**
- Navigation: Sidebar navigation with collapsible menu
- Tables: Sortable, filterable data tables with pagination
- Forms: Multi-step forms with validation
- Modals: Dialog-based workflows
- Notifications: Toast notifications for feedback
- Charts: Line, bar, pie charts for analytics
- File Upload: Drag-and-drop file uploader

**Accessibility:**
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatible
- High contrast mode support
- Focus indicators

**Responsive Design:**
- Desktop-first approach
- Tablet support (768px+)
- Mobile support (limited features, 375px+)

---

### 1.2 Web Learner Platform (Next.js)

**Purpose:** Learning interface for Learner role

**Technology Stack:**
- Framework: Next.js 14+ (App Router)
- Rendering: Server-Side Rendering (SSR) + Static Site Generation (SSG)
- UI Library: shadcn/ui (Radix UI + Tailwind CSS)
- State Management: React Query + Zustand
- Forms: React Hook Form + Zod validation

**Screen Resolution:**
- Minimum: 375x667 (Mobile)
- Recommended: 1920x1080 (Desktop)
- Supported: All standard resolutions

**Browser Support:**
- Chrome 90+ (Primary)
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

**Key Features:**
- Course catalog with search and filters
- Course detail pages with curriculum
- Video player for lessons (HLS streaming)
- Quiz and assessment interface
- Flashcard study interface with SRS
- Live class join interface (WebRTC)
- Progress tracking dashboard
- Certificate download
- Community blog and comments
- User profile and settings

**UI Components:**
- Navigation: Top navigation bar + mobile hamburger menu
- Course Cards: Grid layout with thumbnails
- Video Player: Custom video player with controls
- Quiz Interface: Step-by-step quiz navigation
- Flashcard Viewer: Card flip animation
- Progress Bars: Visual progress indicators
- Notifications: Real-time notification center
- Chat: Live class chat interface

**Accessibility:**
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatible
- Closed captions for videos
- Adjustable font sizes

**Responsive Design:**
- Mobile-first approach
- Fully responsive (375px to 4K)
- Touch-optimized for tablets and phones

**SEO Optimization:**
- Server-side rendering for SEO
- Meta tags and Open Graph
- Structured data (JSON-LD)
- Sitemap generation
- Robots.txt configuration

---

### 1.3 Mobile Web (Responsive)

**Purpose:** Mobile-optimized learning experience

**Technology Stack:**
- Same as Web Learner Platform (Next.js)
- Progressive Web App (PWA) capabilities

**Screen Resolution:**
- Minimum: 320x568 (iPhone SE)
- Recommended: 375x667 (iPhone 8)
- Supported: All mobile devices

**Browser Support:**
- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet
- Firefox Mobile

**Key Features:**
- Simplified navigation
- Touch-optimized controls
- Offline support (PWA)
- Push notifications
- Camera access for assignments
- Microphone access for live classes

**UI Adaptations:**
- Bottom navigation bar
- Swipe gestures
- Pull-to-refresh
- Native-like transitions
- Optimized for one-handed use

**Performance:**
- Lazy loading images
- Code splitting
- Service worker caching
- Optimized bundle size (<200KB initial)

---

## 2. Hardware Interfaces

This section describes hardware requirements and interfaces.

### 2.1 Client-Side Hardware

**Minimum Requirements:**
- **Processor:** Dual-core 2.0 GHz or equivalent
- **RAM:** 4 GB
- **Storage:** 500 MB free space (for PWA cache)
- **Display:** 1280x720 resolution
- **Network:** 5 Mbps internet connection

**Recommended Requirements:**
- **Processor:** Quad-core 2.5 GHz or equivalent
- **RAM:** 8 GB
- **Storage:** 2 GB free space
- **Display:** 1920x1080 resolution
- **Network:** 25 Mbps internet connection

**Peripheral Devices:**
- **Webcam:** 720p or higher (for live classes)
- **Microphone:** Built-in or external (for live classes)
- **Speakers/Headphones:** For audio playback
- **Mouse/Trackpad:** For desktop navigation
- **Touchscreen:** Optional (for tablet/mobile)

---

### 2.2 Server-Side Hardware

**Production Environment:**
- **CPU:** 8-core 3.0 GHz (per service instance)
- **RAM:** 16 GB (per service instance)
- **Storage:** 500 GB SSD (database), 2 TB HDD (file storage)
- **Network:** 1 Gbps dedicated connection
- **Load Balancer:** Hardware or software load balancer

**Database Server:**
- **CPU:** 16-core 3.5 GHz
- **RAM:** 64 GB
- **Storage:** 2 TB NVMe SSD (RAID 10)
- **Backup:** Daily incremental, weekly full backup

**File Storage:**
- **Type:** S3-compatible object storage (AWS S3 or MinIO)
- **Capacity:** 10 TB (scalable)
- **Redundancy:** Multi-region replication

**Live Streaming Infrastructure:**
- **LiveKit Server:** Dedicated server for WebRTC
- **CPU:** 16-core 3.5 GHz
- **RAM:** 32 GB
- **Network:** 10 Gbps (for concurrent streams)

---

## 3. Software Interfaces

This section describes all external software systems and APIs.

### 3.1 Payment Gateway Interfaces

#### 3.1.1 VNPay Integration

**Interface Type:** REST API over HTTPS

**Purpose:** Process payments for Vietnamese users

**API Endpoints:**
- **Create Payment:** `POST https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
- **Query Transaction:** `POST https://sandbox.vnpayment.vn/merchant_webapi/api/transaction`
- **Refund:** `POST https://sandbox.vnpayment.vn/merchant_webapi/api/refund`

**Authentication:**
- Hash-based authentication (HMAC SHA512)
- Merchant ID and Secret Key

**Data Format:**
- Request: URL-encoded form data
- Response: URL-encoded query string (IPN) or JSON

**Integration Points:**
- Payment creation from Identity Service
- Webhook callback for payment confirmation
- Transaction status query

**Error Handling:**
- Retry mechanism for failed requests (3 attempts)
- Webhook verification for security
- Transaction logging for audit

**Test Environment:**
- Sandbox URL: `https://sandbox.vnpayment.vn`
- Test cards provided by VNPay

---

#### 3.1.2 MoMo Integration

**Interface Type:** REST API over HTTPS

**Purpose:** E-wallet payment for Vietnamese users

**API Endpoints:**
- **Create Payment:** `POST https://test-payment.momo.vn/v2/gateway/api/create`
- **Query Transaction:** `POST https://test-payment.momo.vn/v2/gateway/api/query`
- **Refund:** `POST https://test-payment.momo.vn/v2/gateway/api/refund`

**Authentication:**
- HMAC SHA256 signature
- Partner Code and Access Key

**Data Format:**
- Request: JSON
- Response: JSON

**Integration Points:**
- Payment creation from Identity Service
- IPN (Instant Payment Notification) webhook
- Transaction status query

**Error Handling:**
- Retry mechanism for failed requests
- Signature verification for webhooks
- Transaction logging

**Test Environment:**
- Test URL: `https://test-payment.momo.vn`
- Test wallet provided by MoMo

---

#### 3.1.3 ZaloPay Integration

**Interface Type:** REST API over HTTPS

**Purpose:** E-wallet payment for Vietnamese users

**API Endpoints:**
- **Create Order:** `POST https://sb-openapi.zalopay.vn/v2/create`
- **Query Order:** `POST https://sb-openapi.zalopay.vn/v2/query`
- **Refund:** `POST https://sb-openapi.zalopay.vn/v2/refund`

**Authentication:**
- MAC (Message Authentication Code)
- App ID and Key

**Data Format:**
- Request: JSON
- Response: JSON

**Integration Points:**
- Payment creation from Identity Service
- Callback URL for payment confirmation
- Order status query

**Error Handling:**
- Retry mechanism for failed requests
- MAC verification for callbacks
- Transaction logging

**Test Environment:**
- Sandbox URL: `https://sb-openapi.zalopay.vn`
- Test app credentials provided by ZaloPay

---

### 3.2 OAuth Provider Interfaces

#### 3.2.1 Google OAuth 2.0

**Interface Type:** OAuth 2.0 / OpenID Connect

**Purpose:** Third-party authentication

**API Endpoints:**
- **Authorization:** `GET https://accounts.google.com/o/oauth2/v2/auth`
- **Token Exchange:** `POST https://oauth2.googleapis.com/token`
- **User Info:** `GET https://www.googleapis.com/oauth2/v3/userinfo`
- **Token Verification:** `GET https://oauth2.googleapis.com/tokeninfo`

**Authentication:**
- Client ID and Client Secret
- OAuth 2.0 Authorization Code Flow

**Data Format:**
- Request: URL-encoded form data
- Response: JSON

**Scopes Required:**
- `openid`: OpenID Connect
- `email`: User email address
- `profile`: User profile information

**Integration Points:**
- Login/Registration flow in Identity Service
- User profile sync
- Email verification bypass for Google users

**User Data Retrieved:**
- `sub`: Google user ID
- `email`: User email
- `email_verified`: Email verification status
- `name`: Full name
- `picture`: Profile picture URL
- `given_name`, `family_name`: Name components

**Security:**
- HTTPS only
- State parameter for CSRF protection
- Token validation before use

---

### 3.3 Email Service Interface

#### 3.3.1 SMTP Email Service

**Interface Type:** SMTP over TLS

**Purpose:** Transactional email delivery

**SMTP Configuration:**
- **Host:** `smtp.gmail.com` (or custom SMTP server)
- **Port:** 587 (TLS) or 465 (SSL)
- **Authentication:** Username/Password or OAuth 2.0

**Email Types:**
- Welcome email (registration)
- Email verification
- Password reset
- Enrollment confirmation
- Course completion certificate
- Payment receipt
- Live class reminders
- System notifications

**Email Format:**
- **Content-Type:** `multipart/alternative` (HTML + Plain Text)
- **Encoding:** UTF-8
- **Attachments:** Supported (certificates, receipts)

**Templates:**
- HTML templates with inline CSS
- Responsive design for mobile
- Multi-language support (EN, VI, JP)

**Integration Points:**
- Email Service in Identity Service
- Email Service in Learning Service
- Notification Service

**Rate Limiting:**
- Maximum 100 emails per minute
- Batch sending for bulk notifications

**Error Handling:**
- Retry mechanism (3 attempts with exponential backoff)
- Failed email logging
- Bounce and complaint handling

**Monitoring:**
- Delivery rate tracking
- Bounce rate monitoring
- Open rate tracking (optional)

---

### 3.4 AI Service Interface

#### 3.4.1 FastMCP (Fast Model Context Protocol)

**Interface Type:** FastMCP Protocol over WebSocket/HTTP

**Purpose:** AI-powered learning features

**API Endpoints:**
- **Sensei Agent:** Grammar assistance, translation
- **Assessment Agent:** Auto-grading, feedback generation
- **Analytics Agent:** Learning recommendations

**Authentication:**
- API Key authentication
- Rate limiting per API key

**Data Format:**
- Request: JSON
- Response: JSON (streaming or complete)

**Integration Points:**
- Agents Service (Sensei, Assessment, Analytics modules)
- Real-time grammar checking
- Flashcard generation from documents
- Quiz question generation

**Request/Response Examples:**

**Grammar Check Request:**
```json
{
  "agent": "sensei",
  "action": "check_grammar",
  "text": "私は学校に行きました",
  "language": "ja"
}
```

**Grammar Check Response:**
```json
{
  "corrections": [],
  "score": 100,
  "feedback": "Perfect grammar!"
}
```

**Error Handling:**
- Timeout: 30 seconds
- Retry: 2 attempts
- Fallback: Return generic response

**Rate Limiting:**
- 100 requests per minute per user
- 10,000 requests per day per API key

---

#### 3.4.2 Google Gemini API

**Interface Type:** REST API over HTTPS

**Purpose:** Advanced AI features (content generation, analysis)

**API Endpoints:**
- **Generate Content:** `POST https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent`

**Authentication:**
- API Key in header: `x-goog-api-key`

**Data Format:**
- Request: JSON
- Response: JSON

**Use Cases:**
- Flashcard generation from documents
- Quiz question generation
- Content summarization
- Translation assistance

**Rate Limiting:**
- 60 requests per minute
- Quota management via Google Cloud Console

---

### 3.5 LiveKit Server Interface

#### 3.5.1 LiveKit WebRTC Infrastructure

**Interface Type:** WebRTC + REST API

**Purpose:** Real-time video/audio streaming for live classes

**API Endpoints:**
- **Create Room:** `POST https://livekit-server/twirp/livekit.RoomService/CreateRoom`
- **List Rooms:** `POST https://livekit-server/twirp/livekit.RoomService/ListRooms`
- **Delete Room:** `POST https://livekit-server/twirp/livekit.RoomService/DeleteRoom`
- **Create Token:** Server-side token generation

**Authentication:**
- API Key and Secret
- JWT tokens for participants

**Data Format:**
- Request: JSON (Twirp protocol)
- Response: JSON

**Integration Points:**
- Meet Service for room management
- NATS for auth callout
- WebSocket for real-time events

**WebRTC Features:**
- Video streaming (up to 1080p)
- Audio streaming (Opus codec)
- Screen sharing
- Recording (to S3)
- Simulcast for adaptive quality

**Auth Callout Flow:**
```
1. Client requests room token from Meet Service
2. Meet Service validates enrollment
3. Meet Service requests auth from Gateway via NATS
4. Gateway validates JWT token
5. Gateway returns auth response
6. Meet Service generates LiveKit token
7. Client connects to LiveKit with token
8. LiveKit validates token via NATS auth callout
```

**Configuration:**
- **API Key:** `APIiYAA5w37Cfo2`
- **Secret:** `6aNur7qqupeZhFYNOJVUyeXxXhVw8f4lm13pEDUx8SgB`
- **URL:** `http://localhost:7880` (local), `wss://livekit.example.com` (production)

**Error Handling:**
- Connection retry mechanism
- Fallback to audio-only mode
- Reconnection on network issues

---

### 3.6 File Storage Interface

#### 3.6.1 S3-Compatible Object Storage

**Interface Type:** S3 API over HTTPS

**Purpose:** File storage for course materials, user uploads, recordings

**API Operations:**
- **Upload:** `PUT /bucket/object`
- **Download:** `GET /bucket/object`
- **Delete:** `DELETE /bucket/object`
- **List:** `GET /bucket?prefix=...`
- **Generate Presigned URL:** Server-side operation

**Authentication:**
- AWS Signature Version 4
- Access Key ID and Secret Access Key

**Storage Providers:**
- **Production:** AWS S3
- **Development:** MinIO (local S3-compatible storage)

**Buckets:**
- `torii-course-videos`: Course video files
- `torii-course-materials`: PDF, slides, documents
- `torii-user-uploads`: User avatars, assignments
- `torii-live-recordings`: Live class recordings
- `torii-certificates`: Generated certificates

**File Types Supported:**
- Videos: MP4, WebM, HLS (.m3u8)
- Images: JPEG, PNG, WebP, SVG
- Documents: PDF, DOCX, PPTX
- Audio: MP3, WAV, OGG

**Upload Limits:**
- Maximum file size: 100 MB (general), 2 GB (videos)
- Allowed MIME types: Validated server-side

**Integration Points:**
- Storage Service in Learning Service
- Storage Service in Identity Service
- Direct upload from client (presigned URLs)

**Security:**
- Private buckets (not publicly accessible)
- Presigned URLs with expiration (15 minutes)
- CORS configuration for client uploads

**CDN Integration:**
- CloudFront (AWS) or custom CDN
- Cache-Control headers
- Optimized delivery for videos

---

### 3.7 Database Interface

#### 3.7.1 PostgreSQL Database

**Interface Type:** PostgreSQL Wire Protocol

**Purpose:** Primary data storage

**Connection:**
- **Host:** `localhost:5432` (local), managed service (production)
- **Database:** `wajlc`
- **User:** `postgres`
- **SSL:** Required in production

**ORM:** Prisma

**Connection Pooling:**
- Maximum connections: 100
- Minimum connections: 10
- Connection timeout: 30 seconds

**Backup Strategy:**
- Daily incremental backups
- Weekly full backups
- Point-in-time recovery enabled
- Retention: 30 days

**Performance:**
- Indexes on frequently queried fields
- Query optimization
- Read replicas for read-heavy operations

---

#### 3.7.2 Redis Cache

**Interface Type:** Redis Protocol

**Purpose:** Caching and session storage

**Connection:**
- **Host:** `localhost:6379` (local), managed service (production)
- **Authentication:** Password-protected in production

**Use Cases:**
- Session storage (JWT blacklist, 2FA temp tokens)
- Rate limiting counters
- Verification tokens (email, password reset)
- OTP codes
- Cache for frequently accessed data

**TTL Strategy:**
- JWT blacklist: Until token expiry
- 2FA temp tokens: 5 minutes
- Verification tokens: 24 hours
- OTP codes: 10 minutes
- Rate limit counters: 1 hour

**Persistence:**
- RDB snapshots every 5 minutes
- AOF (Append-Only File) enabled

---

## 4. Communication Interfaces

This section describes network protocols and communication standards.

### 4.1 HTTP/HTTPS REST API

**Protocol:** HTTP/1.1, HTTP/2

**Base URLs:**
- **Development:** `http://localhost:8080`
- **Production:** `https://api.torii-nihongo.com`

**Request Format:**
- **Content-Type:** `application/json`
- **Encoding:** UTF-8
- **Authentication:** Bearer token in `Authorization` header

**Response Format:**
- **Content-Type:** `application/json`
- **Status Codes:** Standard HTTP status codes (200, 201, 400, 401, 403, 404, 500)

**Error Response:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2026-01-11T14:30:00.000Z",
  "path": "/api/courses"
}
```

**Rate Limiting:**
- **Header:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Limit:** 100 requests per minute per IP
- **Response:** 429 Too Many Requests

**CORS:**
- **Allowed Origins:** Whitelisted domains
- **Allowed Methods:** GET, POST, PUT, PATCH, DELETE
- **Allowed Headers:** Content-Type, Authorization
- **Credentials:** Allowed

---

### 4.2 WebSocket

**Protocol:** WebSocket (RFC 6455)

**Purpose:** Real-time communication for live classes

**Endpoints:**
- **Live Class Chat:** `wss://api.torii-nihongo.com/ws/live-class/{roomId}`
- **Notifications:** `wss://api.torii-nihongo.com/ws/notifications`

**Authentication:**
- JWT token in connection query parameter or header

**Message Format:**
- **Type:** JSON
- **Structure:**
```json
{
  "type": "message",
  "data": {
    "userId": "uuid",
    "content": "Hello",
    "timestamp": "2026-01-11T14:30:00.000Z"
  }
}
```

**Events:**
- `message`: Chat message
- `user_joined`: User joined room
- `user_left`: User left room
- `hand_raised`: User raised hand
- `poll_created`: Poll created
- `poll_voted`: User voted on poll

**Heartbeat:**
- Ping/Pong every 30 seconds
- Auto-reconnect on disconnect

---

### 4.3 NATS Message Broker

**Protocol:** NATS Protocol

**Purpose:** Inter-service communication and event streaming

**Connection:**
- **URL:** `nats://localhost:4222` (local)
- **Cluster:** Multi-node cluster in production

**Authentication:**
- Token-based authentication
- TLS encryption in production

**Message Patterns:**
- **Publish/Subscribe:** Event broadcasting
- **Request/Reply:** Synchronous RPC
- **Queue Groups:** Load balancing

**Subjects:**
- `course.published`: Course published event
- `user.registered`: User registration event
- `payment.completed`: Payment completed event
- `auth.request`: LiveKit auth callout
- `system.worker`: WebSocket worker stream

**JetStream:**
- Persistent message storage
- At-least-once delivery
- Stream replay capability

---

### 4.4 gRPC (Future)

**Protocol:** gRPC over HTTP/2

**Purpose:** High-performance inter-service communication (planned)

**Status:** Not implemented yet, planned for future optimization

---

## 📊 Interface Summary

| Interface Type | Protocol | Purpose | Status |
|----------------|----------|---------|--------|
| Web Admin | HTTPS | Admin UI | ✅ Active |
| Web Learner | HTTPS | Learning UI | ✅ Active |
| Mobile Web | HTTPS | Mobile UI | ✅ Active |
| VNPay | HTTPS/REST | Payment | ✅ Active |
| MoMo | HTTPS/REST | Payment | ✅ Active |
| ZaloPay | HTTPS/REST | Payment | ✅ Active |
| Google OAuth | OAuth 2.0 | Authentication | ✅ Active |
| SMTP | SMTP/TLS | Email | ✅ Active |
| FastMCP | WebSocket/HTTP | AI Features | ✅ Active |
| Gemini API | HTTPS/REST | AI Features | ✅ Active |
| LiveKit | WebRTC/REST | Live Classes | ✅ Active |
| S3/MinIO | S3 API | File Storage | ✅ Active |
| PostgreSQL | PostgreSQL | Database | ✅ Active |
| Redis | Redis Protocol | Cache | ✅ Active |
| NATS | NATS Protocol | Messaging | ✅ Active |
| WebSocket | WebSocket | Real-time | ✅ Active |

---

## 🔒 Security Considerations

### API Security
- HTTPS/TLS 1.3 for all external communications
- API key rotation every 90 days
- JWT token expiration and refresh
- Rate limiting on all endpoints
- Input validation and sanitization

### Data Privacy
- GDPR compliance for EU users
- Data encryption at rest and in transit
- Personal data anonymization in logs
- Right to be forgotten implementation

### Third-Party Security
- Webhook signature verification
- OAuth state parameter for CSRF protection
- Payment gateway PCI DSS compliance
- Regular security audits

---

**Last Updated:** 2026-01-11  
**Version:** 1.0  
**Status:** ✅ Complete
