# Software Requirements Specification (SRS) - Complete Document

**Project:** Torii Nihongo Learning Platform  
**Project Code:** SP26SE005  
**Version:** 1.0  
**Date:** December 2024

---

## 📋 Tổng quan

Tài liệu Software Requirements Specification (SRS) này mô tả đầy đủ các yêu cầu chức năng và phi chức năng cho hệ thống **Torii Nihongo** - Giải pháp lớp học trực tuyến WebRTC và AI phản hồi thời gian thực bằng FastMCP cho trung tâm Nhật Ngữ.

---

## 📚 Cấu trúc tài liệu

Tài liệu SRS được chia thành 10 phần chính:

### ✅ Section 1: Introduction
**File:** [`srs-01-introduction.md`](srs-01-introduction.md)

- Purpose và Scope
- Definitions, Acronyms, Abbreviations
- References
- Document Overview

### ✅ Section 2: Overall Description
**File:** [`srs-02-overall-description.md`](srs-02-overall-description.md)

- Product Perspective
- Product Functions
- User Classes và Characteristics
- Operating Environment
- Design Constraints
- Assumptions và Dependencies

### ✅ Section 3: System Architecture
**File:** [`srs-03-architecture.md`](srs-03-architecture.md)

- Architecture Overview
- Service Descriptions (Gateway, Identity, Learning, Agents, Meet)
- Technology Stack
- Data Flow Diagrams
- Deployment Architecture

### ✅ Section 4: External Interface Requirements
**File:** [`srs-04-interfaces.md`](srs-04-interfaces.md)

- User Interfaces (Web Admin, Web Learner, Mobile)
- Hardware Interfaces
- Software Interfaces (LiveKit, Payment Gateways, OAuth, Email, Storage, AI)
- Communication Interfaces (REST API, WebSocket, NATS, Webhooks)

### ✅ Section 5: Non-Functional Requirements
**File:** [`srs-05-non-functional.md`](srs-05-non-functional.md)

- Performance Requirements
- Security Requirements
- Reliability Requirements
- Scalability Requirements
- Usability Requirements
- Maintainability Requirements
- Portability Requirements

### ✅ Section 6: Use Cases
**File:** [`srs-06-use-cases.md`](srs-06-use-cases.md)

- Use Case Diagram
- Detailed Use Cases (20+ use cases)
- Use Case Priority

### ✅ Section 7: API Specifications
**File:** [`srs-07-api-specifications.md`](srs-07-api-specifications.md)

- API Overview
- Authentication Endpoints
- Course Endpoints
- Live Class Endpoints
- Quiz Endpoints
- Payment Endpoints
- Error Response Format
- Rate Limiting

### ✅ Section 8: Acceptance Criteria
**File:** [`srs-08-acceptance-criteria.md`](srs-08-acceptance-criteria.md)

- Acceptance Test Overview
- Learner Acceptance Criteria (5 sets)
- Lecturer Acceptance Criteria (2 sets)
- Staff Acceptance Criteria (3 sets)
- Admin Acceptance Criteria (2 sets)
- System-Level Acceptance Criteria
- Test Priority Matrix
- Test Execution Plan

### ✅ Section 9: Appendices
**File:** [`srs-09-appendices.md`](srs-09-appendices.md)

- Glossary (A-Z)
- Abbreviations
- References
- Change History
- Document Approval
- Related Documents
- Contact Information

---

## 🗂️ Related Documents

### Database Design Documents
- [`database-design-overview.md`](database-design-overview.md) - ERD và overview
- [`database-design-schema.md`](database-design-schema.md) - Schema chi tiết (Part 1)
- [`database-design-schema-part2.md`](database-design-schema-part2.md) - Schema chi tiết (Part 2)
- [`database-design-user-stories.md`](database-design-user-stories.md) - User stories và flows
- [`database-design-README.md`](database-design-README.md) - Database design tổng hợp

### Other Documents
- [`srs-outline.md`](srs-outline.md) - SRS outline và checklist
- [`README.md`](../README.md) - Project setup và architecture
- [`architecture-comparison.md`](architecture-comparison.md) - Architecture comparison

---

## 📊 Document Status

| Section | Status | Completion |
|---------|--------|------------|
| Section 1: Introduction | ✅ Complete | 100% |
| Section 2: Overall Description | ✅ Complete | 100% |
| Section 3: System Architecture | ✅ Complete | 100% |
| Section 4: External Interfaces | ✅ Complete | 100% |
| Section 5: Non-Functional | ✅ Complete | 100% |
| Section 6: Use Cases | ✅ Complete | 100% |
| Section 7: API Specifications | ✅ Complete | 100% |
| Section 8: Acceptance Criteria | ✅ Complete | 100% |
| Section 9: Appendices | ✅ Complete | 100% |
| **Overall** | **✅ Complete** | **100%** |

---

## 🎯 Key Features Covered

### Functional Requirements
- ✅ User Management & Authentication
- ✅ Course Management (VOD & Live)
- ✅ Enrollment & Learning Progress
- ✅ Live Classes (WebRTC)
- ✅ Assessments & Quizzes
- ✅ Payments & Financial
- ✅ Flashcards & Vocabulary
- ✅ Assignments & Submissions
- ✅ Gamification
- ✅ Community & Content
- ✅ AI Features (FastMCP)

### Non-Functional Requirements
- ✅ Performance (Response time, throughput, scalability)
- ✅ Security (Authentication, authorization, encryption)
- ✅ Reliability (Availability, fault tolerance, backup)
- ✅ Usability (UI/UX, accessibility, multi-language)
- ✅ Maintainability (Code quality, testing, monitoring)

### System Architecture
- ✅ Microservices Architecture
- ✅ HTTP + NATS Hybrid Communication
- ✅ 5 Core Services (Gateway, Identity, Learning, Agents, Meet)
- ✅ Technology Stack (NestJS, Prisma, PostgreSQL, LiveKit, etc.)

---

## 📝 Usage Guide

### For Developers
1. Start with **Section 3: Architecture** để hiểu system design
2. Review **Section 7: API Specifications** để implement APIs
3. Reference **Database Design Documents** để implement data layer
4. Check **Section 8: Acceptance Criteria** để viết tests

### For QA Engineers
1. Review **Section 6: Use Cases** để hiểu user flows
2. Use **Section 8: Acceptance Criteria** để design test cases
3. Reference **Section 5: Non-Functional** để test performance/security

### For Project Managers
1. Review **Section 1: Introduction** và **Section 2: Overall Description**
2. Check **Section 8: Acceptance Criteria** để track progress
3. Reference **Section 9: Appendices** cho glossary và references

### For Stakeholders
1. Start with **Section 1: Introduction** để hiểu overview
2. Review **Section 2: Overall Description** để hiểu features
3. Check **Section 6: Use Cases** để hiểu user experience

---

## 🔄 Document Maintenance

**Review Schedule:**
- Monthly review during development
- Quarterly review after release
- Ad-hoc review when major changes occur

**Update Process:**
1. Document changes in Change History (Section 9)
2. Update version number
3. Get approval from stakeholders
4. Publish updated document

**Version Control:**
- All documents stored in Git repository
- Tagged with version numbers
- Change tracking via Git history

---

## ✅ Checklist

- [x] Section 1: Introduction
- [x] Section 2: Overall Description
- [x] Section 3: System Architecture
- [x] Section 4: External Interfaces
- [x] Section 5: Non-Functional Requirements
- [x] Section 6: Use Cases
- [x] Section 7: API Specifications
- [x] Section 8: Acceptance Criteria
- [x] Section 9: Appendices
- [x] Database Design Documents
- [x] ERD Diagrams
- [x] User Stories
- [x] Business Rules

**Status:** ✅ **SRS Document Complete**

---

## 📞 Contact

**Questions or Updates:**
- Create issue in project repository
- Contact project team via email
- Review document in team meetings

---

**Last Updated:** 2024-12-28  
**Version:** 1.0  
**Status:** ✅ Complete

