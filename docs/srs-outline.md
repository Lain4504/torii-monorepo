# Software Requirements Specification (SRS) - Outline

## Project: Torii Nihongo Learning Platform
**Project Code:** SP26SE005

---

## ✅ Đã có (Từ Database Design Documents)

### 1. Database Design ✅
- [x] ERD Diagram (`database-design-overview.md`)
- [x] Detailed Schema (`database-design-schema.md`, `database-design-schema-part2.md`)
- [x] Business Rules
- [x] Relationships và Constraints

### 2. User Stories & Flows ✅
- [x] Learner user stories (8 stories)
- [x] Lecturer user stories (5 stories)
- [x] Staff user stories (5 stories)
- [x] Admin user stories (3 stories)
- [x] Database operations cho mỗi flow

### 3. Functional Requirements ✅
- [x] Course Management
- [x] Live Classes (WebRTC)
- [x] Assessments & Quizzes
- [x] Payments & Coupons
- [x] Flashcards
- [x] Assignments
- [x] Gamification
- [x] User Management

---

## ❌ Cần bổ sung cho SRS hoàn chỉnh

### 1. Introduction & Project Overview ❌
- [ ] 1.1. Purpose of Document
- [ ] 1.2. Scope of Project
- [ ] 1.3. Definitions, Acronyms, Abbreviations
- [ ] 1.4. References
- [ ] 1.5. Overview of Document

### 2. Overall Description ❌
- [ ] 2.1. Product Perspective
  - [ ] System Context Diagram
  - [ ] Integration với third-party services (LiveKit, Payment Gateways, OAuth)
- [ ] 2.2. Product Functions (High-level)
- [ ] 2.3. User Classes and Characteristics
  - [ ] Learner
  - [ ] Lecturer
  - [ ] Staff
  - [ ] Admin
- [ ] 2.4. Operating Environment
  - [ ] Development environment
  - [ ] Production environment
  - [ ] Browser support
  - [ ] Mobile support
- [ ] 2.5. Design and Implementation Constraints
  - [ ] Technology constraints
  - [ ] Regulatory constraints
  - [ ] Standards compliance
- [ ] 2.6. Assumptions and Dependencies

### 3. System Architecture ❌
- [ ] 3.1. Architecture Overview
  - [ ] Microservices architecture diagram
  - [ ] Service communication patterns (HTTP + NATS)
- [ ] 3.2. Service Descriptions
  - [ ] Gateway Service
  - [ ] Identity Service
  - [ ] Learning Service
  - [ ] Agents Service (AI)
  - [ ] Meet Service (WebRTC)
- [ ] 3.3. Technology Stack
  - [ ] Backend: NestJS, Prisma, PostgreSQL
  - [ ] Frontend: React, Next.js, Vite
  - [ ] Real-time: LiveKit, NATS
  - [ ] AI: FastMCP
- [ ] 3.4. Data Flow Diagrams
- [ ] 3.5. Deployment Architecture

### 4. External Interface Requirements ❌
- [ ] 4.1. User Interfaces
  - [ ] Web Admin Dashboard (React)
  - [ ] Web Learner Platform (Next.js)
  - [ ] Mobile App (nếu có)
- [ ] 4.2. Hardware Interfaces
- [ ] 4.3. Software Interfaces
  - [ ] LiveKit API integration
  - [ ] Payment Gateway APIs (VNPay, MoMo, ZaloPay)
  - [ ] OAuth Providers (Google)
  - [ ] Email Service (SMTP)
  - [ ] File Storage (S3/MinIO)
- [ ] 4.4. Communication Interfaces
  - [ ] REST API specifications
  - [ ] WebSocket protocol
  - [ ] NATS message patterns

### 5. System Features (Detailed Functional Requirements) ⚠️
- [x] 5.1. User Management & Authentication (có trong user stories)
- [x] 5.2. Course Management (có trong user stories)
- [x] 5.3. Live Classes (có trong user stories)
- [x] 5.4. Assessments & Quizzes (có trong user stories)
- [x] 5.5. Payments (có trong user stories)
- [ ] 5.6. **API Specifications** (cần bổ sung)
  - [ ] Endpoint definitions
  - [ ] Request/Response formats
  - [ ] Error handling
  - [ ] Authentication/Authorization
- [ ] 5.7. **UI/UX Requirements** (cần bổ sung)
  - [ ] Screen mockups/wireframes
  - [ ] User interaction flows
  - [ ] Responsive design requirements

### 6. Non-Functional Requirements ❌
- [ ] 6.1. Performance Requirements
  - [ ] Response time: API < 200ms, Page load < 2s
  - [ ] Concurrent users: 1000+ simultaneous
  - [ ] Live class capacity: 50+ participants per room
  - [ ] Database query performance
- [ ] 6.2. Security Requirements
  - [ ] Authentication & Authorization (JWT, RBAC)
  - [ ] Data encryption (in-transit, at-rest)
  - [ ] Payment security (PCI-DSS compliance)
  - [ ] Personal data protection (GDPR-like)
  - [ ] 2FA support
- [ ] 6.3. Reliability Requirements
  - [ ] System uptime: 99.9%
  - [ ] Data backup & recovery
  - [ ] Error handling & logging
- [ ] 6.4. Scalability Requirements
  - [ ] Horizontal scaling capability
  - [ ] Database scaling strategy
  - [ ] CDN for static assets
- [ ] 6.5. Usability Requirements
  - [ ] Accessibility (WCAG 2.1)
  - [ ] Multi-language support (Vietnamese, English, Japanese)
  - [ ] Mobile responsiveness
- [ ] 6.6. Maintainability Requirements
  - [ ] Code documentation
  - [ ] API documentation
  - [ ] Monitoring & logging

### 7. System Models ❌
- [x] 7.1. Data Models (✅ Database Design)
- [ ] 7.2. **Use Case Diagrams** (cần bổ sung)
  - [ ] Use cases cho từng actor
  - [ ] Use case descriptions
- [ ] 7.3. **Sequence Diagrams** (cần bổ sung)
  - [ ] Course purchase flow
  - [ ] Live class join flow
  - [ ] Quiz submission flow
- [ ] 7.4. **State Diagrams** (cần bổ sung)
  - [ ] Enrollment states
  - [ ] Payment states
  - [ ] Live class states

### 8. Acceptance Criteria ❌
- [ ] 8.1. Acceptance Tests
  - [ ] User story acceptance criteria
  - [ ] Integration test scenarios
  - [ ] Performance test scenarios
- [ ] 8.2. Test Cases
  - [ ] Test case matrix
  - [ ] Priority levels

### 9. Appendices ❌
- [ ] 9.1. Glossary
- [ ] 9.2. Abbreviations
- [ ] 9.3. References
- [ ] 9.4. Change History

---

## 📊 Tổng kết

### Đã hoàn thành (100%) ✅
- ✅ Database Design (ERD, Schema, Relationships)
- ✅ User Stories & Flows
- ✅ Business Rules
- ✅ Functional Requirements
- ✅ Introduction & Overview
- ✅ System Architecture (detailed)
- ✅ External Interface Requirements
- ✅ Non-Functional Requirements
- ✅ Use Case Diagrams
- ✅ API Specifications
- ✅ Acceptance Criteria
- ✅ Appendices

### Tài liệu đã tạo
- ✅ `srs-01-introduction.md` - Introduction
- ✅ `srs-02-overall-description.md` - Overall Description
- ✅ `srs-03-architecture.md` - System Architecture
- ✅ `srs-04-interfaces.md` - External Interfaces
- ✅ `srs-05-non-functional.md` - Non-Functional Requirements
- ✅ `srs-06-use-cases.md` - Use Cases
- ✅ `srs-07-api-specifications.md` - API Specifications
- ✅ `srs-08-acceptance-criteria.md` - Acceptance Criteria
- ✅ `srs-09-appendices.md` - Appendices
- ✅ `srs-README.md` - SRS Document Index

---

## 🎯 Đề xuất tạo thêm

1. **`srs-01-introduction.md`** - Introduction & Project Overview
2. **`srs-02-architecture.md`** - System Architecture (dựa trên README.md)
3. **`srs-03-interfaces.md`** - External Interface Requirements
4. **`srs-04-non-functional.md`** - Non-Functional Requirements
5. **`srs-05-use-cases.md`** - Use Case Diagrams & Descriptions
6. **`srs-06-api-specifications.md`** - API Specifications
7. **`srs-07-acceptance-criteria.md`** - Acceptance Criteria & Test Cases
8. **`srs-08-appendices.md`** - Glossary, References, etc.

---

## 💡 Lưu ý

Database design documents hiện tại đã cover:
- ✅ **Section 7.1 (Data Models)** - Hoàn chỉnh
- ✅ **Section 5 (System Features)** - Functional requirements (cần thêm API specs và UI/UX)
- ✅ **User Stories** - Có thể dùng làm base cho Use Cases

**Cần bổ sung thêm ~6-8 documents** để có SRS hoàn chỉnh theo chuẩn IEEE 830 hoặc tương đương.

