# Context Diagram - Torii Nihongo Learning Platform

**Project:** Torii Nihongo  
**Project Code:** SP26SE005  
**Version:** 1.0  
**Date:** January 2026

---

## 📊 System Context Diagram

Context Diagram mô tả toàn bộ hệ thống Torii Nihongo và các tương tác với External Actors (Users) và External Systems.

```mermaid
graph TB
    %% Main Actors (User Roles)
    Learner[Learner<br/>Học viên]
    Lecturer[Lecturer<br/>Giảng viên]
    Admin[Admin<br/>Quản trị viên]
    Staff[Staff<br/>Nhân viên]
    
    %% Central System
    ToriiSystem((Torii Nihongo<br/>Learning Platform<br/><br/>Gateway, Identity,<br/>Learning, Agents, Meet<br/><br/>External Integrations:<br/>Payment Gateways, OAuth,<br/>Email, AI, LiveKit, Storage))
    
    %% ========================================
    %% LEARNER DATA FLOWS
    %% ========================================
    
    %% Authentication & Profile
    Learner -->|register, login, OAuth| ToriiSystem
    Learner -->|update profile, change password| ToriiSystem
    Learner -->|enable 2FA, verify email| ToriiSystem
    
    %% Course Discovery & Enrollment
    Learner -->|browse courses, search, filter| ToriiSystem
    Learner -->|view course details| ToriiSystem
    Learner -->|add to wishlist| ToriiSystem
    Learner -->|enroll course, apply coupon| ToriiSystem
    ToriiSystem -->|course catalog, recommendations| Learner
    ToriiSystem -->|enrollment confirmation| Learner
    
    %% Learning & Progress
    Learner -->|access lessons, watch videos| ToriiSystem
    Learner -->|track progress, mark complete| ToriiSystem
    Learner -->|download materials| ToriiSystem
    ToriiSystem -->|course content, curriculum| Learner
    ToriiSystem -->|progress tracking, certificates| Learner
    
    %% Assessments & Quizzes
    Learner -->|take quiz, submit answers| ToriiSystem
    Learner -->|view quiz results| ToriiSystem
    Learner -->|practice JLPT mock tests| ToriiSystem
    ToriiSystem -->|quiz questions, timer| Learner
    ToriiSystem -->|scores, feedback, explanations| Learner
    
    %% Flashcards & SRS
    Learner -->|create flashcard deck| ToriiSystem
    Learner -->|study flashcards, review| ToriiSystem
    Learner -->|rate card difficulty| ToriiSystem
    ToriiSystem -->|flashcard data, SRS schedule| Learner
    ToriiSystem -->|study statistics, mastery| Learner
    
    %% Live Classes
    Learner -->|join live class| ToriiSystem
    Learner -->|participate, chat, raise hand| ToriiSystem
    Learner -->|view recording| ToriiSystem
    ToriiSystem -->|live class access token| Learner
    ToriiSystem -->|WebRTC stream, chat messages| Learner
    ToriiSystem -->|attendance confirmation| Learner
    
    %% Payments
    Learner -->|make payment, select method| ToriiSystem
    Learner -->|view payment history| ToriiSystem
    Learner -->|request refund| ToriiSystem
    ToriiSystem -->|payment gateway redirect| Learner
    ToriiSystem -->|payment receipt, invoice| Learner
    
    %% Community & Content
    Learner -->|read blog posts| ToriiSystem
    Learner -->|post comments, like| ToriiSystem
    Learner -->|write course review| ToriiSystem
    ToriiSystem -->|blog content, community posts| Learner
    ToriiSystem -->|notifications, updates| Learner
    
    %% AI Features
    Learner -->|request grammar check| ToriiSystem
    Learner -->|get translation help| ToriiSystem
    ToriiSystem -->|AI feedback, suggestions| Learner
    
    %% ========================================
    %% LECTURER DATA FLOWS
    %% ========================================
    
    %% Authentication & Profile
    Lecturer -->|login, update profile| ToriiSystem
    
    %% Course Management
    Lecturer -->|create course, modules, lessons| ToriiSystem
    Lecturer -->|upload videos, materials| ToriiSystem
    Lecturer -->|publish/unpublish course| ToriiSystem
    Lecturer -->|update course content| ToriiSystem
    ToriiSystem -->|course creation confirmation| Lecturer
    ToriiSystem -->|upload progress, URLs| Lecturer
    
    %% Live Class Management
    Lecturer -->|schedule live class| ToriiSystem
    Lecturer -->|start/end class, manage room| ToriiSystem
    Lecturer -->|share screen, enable recording| ToriiSystem
    Lecturer -->|create polls, manage participants| ToriiSystem
    ToriiSystem -->|live class room token| Lecturer
    ToriiSystem -->|participant list, chat| Lecturer
    ToriiSystem -->|recording status, analytics| Lecturer
    
    %% Assessment Creation
    Lecturer -->|create quiz, add questions| ToriiSystem
    Lecturer -->|create assignments| ToriiSystem
    Lecturer -->|grade submissions| ToriiSystem
    ToriiSystem -->|question bank access| Lecturer
    ToriiSystem -->|submission list, grading interface| Lecturer
    
    %% Student Management
    Lecturer -->|view enrolled students| ToriiSystem
    Lecturer -->|track student progress| ToriiSystem
    Lecturer -->|send announcements| ToriiSystem
    ToriiSystem -->|student progress reports| Lecturer
    ToriiSystem -->|analytics dashboard| Lecturer
    ToriiSystem -->|engagement metrics| Lecturer
    
    %% ========================================
    %% ADMIN DATA FLOWS
    %% ========================================
    
    %% Authentication
    Admin -->|admin login, 2FA| ToriiSystem
    
    %% User Management
    Admin -->|create, edit, delete users| ToriiSystem
    Admin -->|assign roles, permissions| ToriiSystem
    Admin -->|ban/unban users| ToriiSystem
    Admin -->|reset user passwords| ToriiSystem
    ToriiSystem -->|user list, details| Admin
    ToriiSystem -->|role & permission matrix| Admin
    
    %% System Configuration
    Admin -->|configure system settings| ToriiSystem
    Admin -->|manage payment gateways| ToriiSystem
    Admin -->|configure email templates| ToriiSystem
    Admin -->|manage integrations| ToriiSystem
    ToriiSystem -->|configuration status| Admin
    
    %% Content Moderation
    Admin -->|approve/reject courses| ToriiSystem
    Admin -->|moderate blog posts, comments| ToriiSystem
    Admin -->|manage reported content| ToriiSystem
    ToriiSystem -->|pending approvals queue| Admin
    
    %% Analytics & Monitoring
    Admin -->|view system analytics| ToriiSystem
    Admin -->|view audit logs| ToriiSystem
    Admin -->|monitor performance| ToriiSystem
    ToriiSystem -->|platform reports, dashboards| Admin
    ToriiSystem -->|audit logs, security events| Admin
    ToriiSystem -->|system health metrics| Admin
    
    %% Financial Management
    Admin -->|view revenue reports| ToriiSystem
    Admin -->|manage coupons, promotions| ToriiSystem
    Admin -->|process refunds| ToriiSystem
    ToriiSystem -->|financial reports, charts| Admin
    
    %% ========================================
    %% STAFF DATA FLOWS
    %% ========================================
    
    %% Authentication
    Staff -->|staff login| ToriiSystem
    
    %% Enrollment Management
    Staff -->|view enrollments| ToriiSystem
    Staff -->|manual enrollment| ToriiSystem
    Staff -->|cancel enrollment| ToriiSystem
    ToriiSystem -->|enrollment list, status| Staff
    
    %% Payment Support
    Staff -->|view payment transactions| ToriiSystem
    Staff -->|verify payments| ToriiSystem
    Staff -->|issue invoices| ToriiSystem
    ToriiSystem -->|payment reports| Staff
    ToriiSystem -->|transaction details| Staff
    
    %% Customer Support
    Staff -->|view support tickets| ToriiSystem
    Staff -->|respond to inquiries| ToriiSystem
    Staff -->|access user accounts| ToriiSystem
    ToriiSystem -->|support data, user info| Staff
    ToriiSystem -->|ticket status updates| Staff
    
    %% Coupon Management
    Staff -->|create coupons| ToriiSystem
    Staff -->|manage promotions| ToriiSystem
    ToriiSystem -->|coupon usage reports| Staff
    
    %% Styling
    classDef actorClass fill:#4A90E2,stroke:#2E5C8A,stroke-width:3px,color:#000
    classDef systemClass fill:#50C878,stroke:#2E7D4E,stroke-width:4px,color:#000,font-size:12px
    
    class Learner,Lecturer,Admin,Staff actorClass
    class ToriiSystem systemClass
```

---

## 🎯 System Boundary

### Internal System (Torii Nihongo Platform)

**Client Applications:**
- **Web Admin Dashboard** (React + Vite): Giao diện quản trị cho Admin, Staff, Lecturer
- **Web Learner Platform** (Next.js): Giao diện học tập cho Learner
- **Mobile Web**: Giao diện responsive cho thiết bị di động

**Backend Microservices:**
- **API Gateway** (Port 8080): Entry point, HTTP proxy, authentication
- **Identity Service** (Port 8081): Authentication, user management, RBAC, payments
- **Learning Service** (Port 8082): LMS, courses, quizzes, flashcards, community
- **Agents Service** (Port 8090): AI-powered features (Sensei, Assessment, Analytics)
- **Meet Service** (Port 8091): Live classes, WebRTC, room management

**Infrastructure Services:**
- **PostgreSQL**: Primary database
- **Redis**: Cache và session storage
- **NATS**: Message broker cho events và WebSocket
- **LiveKit**: WebRTC infrastructure
- **S3/MinIO**: File storage

---

## 👥 External Actors

### 1. Learner (Học viên)
**Interactions:**
- Browse và search courses
- Enroll in courses (VOD và Live)
- Join live classes via WebRTC
- Take quizzes và practice tests
- Study flashcards với SRS algorithm
- Track learning progress
- Participate in community (blog, comments)
- Make payments for courses

**Primary Interface:** Web Learner Platform, Mobile Web

---

### 2. Lecturer (Giảng viên)
**Interactions:**
- Create và manage courses
- Host live classes via WebRTC
- Upload course materials
- Create quizzes và assignments
- Grade student submissions
- View student progress
- Communicate with students

**Primary Interface:** Web Admin Dashboard, Web Learner Platform (for live classes)

---

### 3. Admin (Quản trị viên)
**Interactions:**
- Manage users (Learners, Lecturers, Staff)
- Configure system settings
- Manage roles và permissions
- View system analytics
- Monitor platform health
- Manage payments và refunds
- Handle content moderation

**Primary Interface:** Web Admin Dashboard

---

### 4. Staff (Nhân viên)
**Interactions:**
- Support learners
- Manage enrollments
- Process payments
- Handle customer inquiries
- Manage coupons và promotions
- View reports

**Primary Interface:** Web Admin Dashboard

---

## 🔌 External Systems

### 1. Payment Gateways
**Systems:**
- **VNPay**: Vietnamese payment gateway
- **MoMo**: E-wallet payment
- **ZaloPay**: E-wallet payment

**Integration:**
- Payment processing
- Webhook callbacks
- Refund handling

**Connected Service:** Identity Service

---

### 2. Google OAuth
**Purpose:** Third-party authentication

**Integration:**
- OAuth 2.0 login flow
- User profile retrieval

**Connected Service:** Identity Service

---

### 3. Email Service (SMTP)
**Purpose:** Transactional emails

**Use Cases:**
- Welcome emails
- Password reset
- Course enrollment confirmations
- Payment receipts
- Notifications

**Connected Services:** Identity Service, Learning Service

---

### 4. AI Services (FastMCP/Gemini)
**Purpose:** AI-powered learning features

**Use Cases:**
- Sensei Agent: Grammar assistance, translation
- Assessment Agent: Auto-grading, feedback
- Analytics Agent: Learning recommendations

**Connected Service:** Agents Service

---

### 5. S3/MinIO Storage
**Purpose:** File storage

**Use Cases:**
- Course videos và materials
- User avatars
- Assignment submissions
- Live class recordings

**Connected Services:** All services

---

### 6. LiveKit Server
**Purpose:** WebRTC infrastructure

**Use Cases:**
- Live class video/audio
- Screen sharing
- Real-time collaboration

**Integration:**
- Room management API
- Auth callout via NATS
- Recording webhooks

**Connected Service:** Meet Service

---

## 📡 Communication Protocols

### Client ↔ Backend
- **Protocol:** HTTPS/REST API
- **Format:** JSON
- **Authentication:** JWT Bearer Token

### Backend Services ↔ Infrastructure
- **Database:** PostgreSQL (SQL over TCP)
- **Cache:** Redis (Redis Protocol)
- **Message Broker:** NATS (NATS Protocol)
- **WebRTC:** LiveKit (WebRTC + HTTP API)

### Backend ↔ External Systems
- **Payment Gateways:** HTTPS/REST + Webhooks
- **OAuth:** OAuth 2.0 over HTTPS
- **Email:** SMTP over TLS
- **AI Services:** FastMCP Protocol
- **Storage:** S3 API over HTTPS

---

## 🔐 Security Boundaries

### Authentication Flow
1. User login → Gateway → Identity Service
2. Identity Service validates credentials
3. JWT token issued
4. Token used for subsequent requests

### Authorization
- Role-Based Access Control (RBAC)
- Permission checks at Gateway level
- Service-level authorization

### Data Protection
- HTTPS/TLS for all external communication
- Database encryption at rest
- Secure password hashing (bcrypt)
- 2FA support

---

## 🚀 Key Data Flows

### 1. Course Enrollment Flow
```
Learner → Web Learner → Gateway → Learning Service → Identity Service (Payment) 
→ Payment Gateway → Webhook → Identity Service → Learning Service → Enrollment Created
```

### 2. Live Class Join Flow
```
Learner → Web Learner → Gateway → Meet Service → NATS (Auth) → Gateway (Validate)
→ LiveKit (Create Token) → Meet Service → Learner (Join URL)
```

### 3. Quiz Submission Flow
```
Learner → Web Learner → Gateway → Learning Service → Calculate Score
→ Agents Service (AI Feedback) → Learning Service → Results Returned
```

### 4. AI-Powered Learning Flow
```
Learner → Web Learner → Gateway → Agents Service → FastMCP/Gemini
→ AI Response → Agents Service → Learner
```

---

## 📊 System Characteristics

### Scalability
- Microservices architecture cho horizontal scaling
- Stateless services
- Load balancing via Gateway
- Database read replicas

### Reliability
- Health checks cho tất cả services
- Graceful degradation
- Circuit breakers
- Retry mechanisms

### Performance
- Redis caching
- CDN for static assets
- Database indexing
- Connection pooling

### Security
- JWT authentication
- RBAC authorization
- HTTPS/TLS encryption
- Input validation
- Rate limiting

---

## 📝 Notes

1. **Monorepo Structure:** Toàn bộ codebase được quản lý trong TurboRepo monorepo
2. **Shared Packages:** 
   - `@workspace/schemas`: Zod schemas và DTOs
   - `@workspace/protocol`: Protobuf definitions
   - `@workspace/ui`: Shared UI components
3. **Development Environment:** Docker Compose cho infrastructure, Node.js cho services
4. **Production Environment:** Kubernetes/Docker Swarm cho orchestration

---

**Last Updated:** 2026-01-11  
**Version:** 1.0  
**Status:** ✅ Complete
