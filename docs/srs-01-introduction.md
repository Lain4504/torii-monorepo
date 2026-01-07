# Software Requirements Specification (SRS)
## Section 1: Introduction

**Project:** Torii Nihongo Learning Platform  
**Project Code:** SP26SE005  
**Version:** 1.0  
**Date:** December 2024

---

## 1.1 Purpose

Tài liệu Software Requirements Specification (SRS) này mô tả đầy đủ các yêu cầu chức năng và phi chức năng cho hệ thống **Torii Nihongo** - Giải pháp lớp học trực tuyến WebRTC và AI phản hồi thời gian thực bằng FastMCP cho trung tâm Nhật Ngữ.

Tài liệu này được sử dụng bởi:
- **Developers:** Để hiểu và implement các tính năng
- **Project Managers:** Để lập kế hoạch và theo dõi tiến độ
- **QA Engineers:** Để thiết kế test cases và acceptance criteria
- **Stakeholders:** Để review và approve requirements

---

## 1.2 Scope

### 1.2.1 Product Name
**Torii Nihongo** - WebRTC-based live classes and FastMCP-powered AI feedback solution for a Japanese Learning Center

### 1.2.2 Product Overview
Torii Nihongo là một nền tảng học tập tiếng Nhật trực tuyến toàn diện, tích hợp:

1. **Unified Learning Experience:** Kết hợp course learning, quizzes, exams, và live classes trong một hệ thống tập trung
2. **Interactive Live Classes (WebRTC):** Lớp học trực tuyến chất lượng cao, độ trễ thấp với whiteboard, chat, và screen sharing
3. **AI-Powered Learning Support (FastMCP):** Hệ thống Multi-Agent AI gồm:
   - **Sensei Agent:** Hỗ trợ ngữ pháp, dịch thuật, và flashcards
   - **Assessment Agent:** Tạo và đánh giá bài kiểm tra theo format JLPT
   - **Analytics Agent:** Theo dõi tiến độ và đề xuất lộ trình học tập cá nhân hóa
4. **Adaptive Learning Journey:** Xây dựng trải nghiệm học tập cá nhân hóa theo lộ trình JLPT
5. **Gamification:** Hệ thống điểm thưởng, badges, và vouchers để khuyến khích học tập

### 1.2.3 What the System Will Do
- Quản lý khóa học video (VOD) và lớp học trực tuyến (Live)
- Hỗ trợ thanh toán và mã giảm giá
- Quản lý bài kiểm tra và ngân hàng câu hỏi
- Theo dõi tiến độ học tập
- Quản lý flashcards với thuật toán SRS (Spaced Repetition System)
- Hệ thống bài tập và chấm điểm
- Blog và cộng đồng
- Thông báo và notifications

### 1.2.4 What the System Will Not Do
- Không hỗ trợ offline learning (cần internet connection)
- Không tự động chuyển đổi video format (cần upload đúng format)
- Không tích hợp trực tiếp với các hệ thống LMS bên ngoài (chỉ qua API)
- Không hỗ trợ real-time translation trong live classes (chỉ hỗ trợ AI feedback sau class)

### 1.2.5 Users of the System
- **Learners:** Học viên đăng ký và học các khóa học
- **Lecturers:** Giảng viên dạy live classes và quản lý assignments
- **Staff:** Nhân viên quản lý courses, questions, coupons, và live classes
- **Admin:** Quản trị viên quản lý toàn bộ hệ thống, users, và payments

---

## 1.3 Definitions, Acronyms, and Abbreviations

### Acronyms
- **SRS:** Software Requirements Specification
- **VOD:** Video on Demand
- **WebRTC:** Web Real-Time Communication
- **JLPT:** Japanese Language Proficiency Test
- **API:** Application Programming Interface
- **RBAC:** Role-Based Access Control
- **2FA:** Two-Factor Authentication
- **JWT:** JSON Web Token
- **OAuth:** Open Authorization
- **SMTP:** Simple Mail Transfer Protocol
- **CDN:** Content Delivery Network
- **PCI-DSS:** Payment Card Industry Data Security Standard
- **GDPR:** General Data Protection Regulation
- **WCAG:** Web Content Accessibility Guidelines
- **SRS (Algorithm):** Spaced Repetition System
- **FastMCP:** Fast Model Context Protocol
- **NATS:** NATS Message Broker
- **REST:** Representational State Transfer
- **HTTP:** Hypertext Transfer Protocol
- **HTTPS:** HTTP Secure
- **JSON:** JavaScript Object Notation
- **JSONB:** JSON Binary (PostgreSQL)
- **UUID:** Universally Unique Identifier
- **ORM:** Object-Relational Mapping
- **CRUD:** Create, Read, Update, Delete
- **UI:** User Interface
- **UX:** User Experience

### Definitions
- **Course:** Khóa học có thể là VOD (video) hoặc Live (WebRTC)
- **Module:** Chương/phần trong khóa học
- **Lesson:** Bài học cụ thể trong module
- **Live Class:** Lớp học trực tuyến real-time sử dụng WebRTC
- **Enrollment:** Đăng ký khóa học của học viên
- **Quiz:** Bài kiểm tra có thể là practice test hoặc JLPT mock exam
- **Flashcard Deck:** Bộ flashcard của học viên
- **Assignment:** Bài tập được giảng viên giao cho học viên
- **Coupon:** Mã giảm giá cho khóa học
- **Wallet:** Ví tiền ảo của học viên (credits/points)
- **Achievement:** Thành tựu trong hệ thống gamification
- **Room:** Phòng học ảo trong LiveKit (WebRTC)

---

## 1.4 References

### Internal Documents
- `docs/database-design-overview.md` - Database ERD và overview
- `docs/database-design-schema.md` - Database schema chi tiết
- `docs/database-design-schema-part2.md` - Database schema phần 2
- `docs/database-design-user-stories.md` - User stories và business flows
- `README.md` - Project setup và architecture overview
- `docs/architecture-comparison.md` - Architecture comparison

### External Standards
- IEEE 830-1998: Recommended Practice for Software Requirements Specifications
- ISO/IEC 25010: Systems and software Quality Requirements and Evaluation
- WCAG 2.1: Web Content Accessibility Guidelines
- PCI-DSS: Payment Card Industry Data Security Standard

### Technology Documentation
- NestJS Documentation: https://nestjs.com/
- Prisma Documentation: https://www.prisma.io/docs
- LiveKit Documentation: https://docs.livekit.io/
- FastMCP Documentation: (Internal/External)
- NATS Documentation: https://docs.nats.io/

---

## 1.5 Overview

Tài liệu SRS này được tổ chức thành các phần sau:

- **Section 1: Introduction** (Phần này)
  - Purpose, Scope, Definitions, References, Overview

- **Section 2: Overall Description**
  - Product perspective, functions, user classes, operating environment, constraints

- **Section 3: System Architecture**
  - Architecture overview, service descriptions, technology stack, data flow

- **Section 4: External Interface Requirements**
  - User interfaces, hardware interfaces, software interfaces, communication interfaces

- **Section 5: System Features (Functional Requirements)**
  - Detailed functional requirements cho từng feature

- **Section 6: Non-Functional Requirements**
  - Performance, security, reliability, scalability, usability, maintainability

- **Section 7: System Models**
  - Data models, use case diagrams, sequence diagrams, state diagrams

- **Section 8: Acceptance Criteria**
  - Acceptance tests, test cases, priority levels

- **Section 9: Appendices**
  - Glossary, abbreviations, references, change history

---

## Document Control

**Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-28 | Development Team | Initial SRS document |

**Approval:**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Manager | | | |
| Technical Lead | | | |
| Product Owner | | | |

---

**Next Section:** [Section 2: Overall Description](srs-02-overall-description.md)


