# II. Project Management Plan

## 1. Overview
This document outlines the structured Work Breakdown Structure (WBS), effort estimation, and project scope for the development lifecycle.

### 1.1 Scope & Estimation
Below is the detailed list of WBS items, categorized by phase and iteration, along with their estimated complexity and effort (measured in man-days).

| WBS Item | Task Name | Complexity | Est. Effort (man-days) |
| :--- | :--- | :--- | :--- |
| **1** | **Project Initiating & Planning (01/01/2026 - 03/01/2026)** | | **18** |
| 1.1 | Meeting with mentor | Simple | 1 |
| 1.2 | Meeting with team | Simple | 2 |
| 1.3 | Requirement Analysis | Medium | 2 |
| 1.4 | Problem Analysis | Complex | 2 |
| 1.5 | Determine Project Scope | Complex | 2 |
| 1.6 | Functional & Non-Functional Requirement Lists | Simple | 1 |
| 1.7 | Project Charter, Timeline, Resources, Risk Management, Limitation | Medium | 2 |
| 1.8 | Create Report 1: Project Introduction | Medium | 2 |
| 1.9 | Iteration planning | Simple | 1 |
| 1.10 | Develop a project timeline | Simple | 1 |
| 1.11 | Create Report 2: Project Management Plan | Medium | 2 |
| **2** | **System Design (04/01/2026 - 06/01/2026)** | | **15** |
| 2.1 | Feature List | Simple | 1 |
| 2.2 | User Stories | Medium | 2 |
| 2.3 | Use Case Diagram | Medium | 2 |
| 2.4 | Class Diagram & Architecture Diagram | Medium | 1 |
| 2.5 | Database ERD & Physical Schema | Medium | 2 |
| 2.6 | Component Diagram | Medium | 1 |
| 2.7 | Flow Diagram | Medium | 2 |
| 2.8 | Create Report 3: Software Requirement Specification | Medium | 2 |
| 2.9 | Create Report 4: Software Design Document | Medium | 2 |
| **3** | **Project Setup & Tooling (07/01/2026 - 08/01/2026)** | | **12** |
| 3.1 | Backend (Nest.js API Routes + PostgreSQL) | Complex | 2 |
| 3.2 | Frontend (Next.js + ReactJs) | Medium | 1 |
| 3.3 | Auth + Database Setup (PostgreSQL connection) | Medium | 2 |
| 3.4 | Mobile (Flutter) | Medium | 2 |
| 3.5 | AI (FastMCP) | Complex | 3 |
| 3.6 | Development Tools (Docker, Prisma, LiveKit, Nats, Redis) | Medium | 2 |
| **4** | **Iteration 1 - Core Features (09/01/2026 - 30/01/2026)** | | **25** |
| 4.1 | Weekly Meeting | Simple | 2 |
| 4.2 | Requirement & Design | Medium | 2 |
| 4.3 | Code & Implementation | Medium | 2 |
| 4.4 | Set up Environment | Medium | 2 |
| 4.5 | Create Domain Entities, DTOs & Mapping | Medium | 2 |
| 4.6 | Repository & Service Layers | Medium | 2 |
| 4.7 | Authentication | Medium | 2 |
| 4.8 | Data Validation | Simple | 1 |
| 4.9 | File upload service (Cloudinary/S3/Supabase storage) | Complex | 3 |
| 4.10 | Admin user management endpoints backend | Medium | 2 |
| 4.11 | Middleware for Route Protection & Authorization | Complex | 2 |
| 4.12 | Learner Dashboard (profile, settings, notification preferences) | Medium | 2 |
| 4.13 | Role-Based Access Control (ADMIN/MANAGER/USER permissions) | Simple | 1 |
| **5** | **Iteration 2 - Management System (30/01/2026 - 06/02/2026)** | | **18** |
| 5.1 | Develop CRUD Functions for Core Entities (Course, Module, Lesson, Blog, Question_bank, Flashcard_deck, Wishlist, Quiz, Rewards) | Medium | 5 |
| 5.2 | Build live_classes | Complex | 3 |
| 5.3 | Map Function for Core Entities (Course, Module, Lesson, Post, Question_bank, Flashcard_deck, Wishlist, Quiz, Rewards) | Medium | 2 |
| 5.4 | Admin Dashboard (user management, avenue, analytics) | Complex | 2 |
| 5.5 | Staff Dashboard (staff_lms, staff_operating) | Complex | 2 |
| 5.6 | Lecturer Dashboard (my class, change schedule, assign homework, add learner) | Complex | 2 |
| 5.7 | Learner Dashboard (buy or gift course, take quiz, learning, flashcard, change rewards) | Complex | 2 |
| **6** | **Iteration 3 - Subscription & Payment** | | **7** |
| 6.1 | Integrate Payment Gateway (Stripe/VNPay) | Complex | 3 |
| 6.2 | Develop Subscription Plans & Pricing Models | Medium | 2 |
| 6.3 | Transaction History & Invoice Generation | Medium | 2 |
| **7** | **Iteration 4 - Real-time Notifications** | | **6** |
| 7.1 | Setup Notification Service (WebSocket / Push) | Medium | 2 |
| 7.2 | Define App & System Notification Events | Medium | 1 |
| 7.3 | Broadcast & Targeted Personal Notifications | Complex | 3 |
| **8** | **Iteration 5 - Mobile** | | **48** |
| 8.1 | Login / Register with Email & Password | Simple | 2 |
| 8.2 | Social Login (Google, Facebook) | Medium | 2 |
| 8.3 | Forgot/Reset Password (OTP via email) | Medium | 2 |
| 8.4 | General Dashboard: Learning Progress, Suggested Courses | Medium | 2 |
| 8.5 | Display Upcoming Live Classes / Meets | Medium | 2 |
| 8.6 | Course Discovery: Course List, Search & Filter | Medium | 2 |
| 8.7 | Course Detail: Course Information, Syllabus, Mentor | Medium | 2 |
| 8.8 | Checkout & Payment (Payment Integration / Payment Result) | Complex | 3 |
| 8.9 | Course Player: Video Player, Lesson Navigation | Complex | 3 |
| 8.10 | Progress Tracking: Mark as Learned, Save Video Position | Medium | 2 |
| 8.11 | Homework (Assignments) & App Submission | Complex | 3 |
| 8.12 | Exam System & JLPT Mock Tests | Complex | 3 |
| 8.13 | Online Meeting Integration (Join/Leave Meeting) | Complex | 3 |
| 8.14 | Meet Interaction Features: Chat, Hand Raise, Insights | Complex | 3 |
| 8.15 | Knowledge Base: Browse & Read Articles/News/Study Tips | Simple | 1 |
| 8.16 | Profile Management (Update Avatar, Phone Number, Email) | Simple | 1 |
| 8.17 | Payment & Learning History | Simple | 1 |
| 8.18 | Implement notification system (email & in-app reminders) | Complex | 3 |
| 8.19 | App Settings (Change Language, Light/Dark Theme) | Medium | 2 |
| 8.20 | Implement course (Course list, details, player & tracking) | High | 5 |
| **9** | **Iteration 6 - AI Chat Session Integration (30/01/2026 - 06/02/2026)** | | **8** |
| 9.1 | AI Service Integrations (LLM APIs, Connectors) | Complex | 3 |
| 9.2 | Frontend Chat Interface and Message Streams | Medium | 2 |
| 9.3 | Chat Session Management, History, and Context Memory | Complex | 3 |
| **10**| **Iteration 7 - JLPT Test (06/02/2026 - 12/02/2026)** | | **9** |
| 10.1| Develop JLPT testing & scoring engine | Complex | 4 |
| 10.2| Develop Test Questions & Answer Keys | Medium | 3 |
| 10.3| Implement Mock Test UI and Timer function | Medium | 2 |
| **11**| **Iteration 8 - Evaluation & Feedback System (04/03/2026 - 02/04/2026)** | | **7** |
| 11.1| Evaluate the whole product | Complex | 5 |
| 11.2| Build User Survey and Feedback forms | Medium | 2 |
| **12**| **Testing, Debugging & Evaluation** | | **28** |
| 12.1| Unit Test | Medium | 4 |
| 12.2| Integration Test | Complex | 4 |
| 12.3| E2E Test (Critical flows: signup → chat → submit → evaluate) | Complex | 4 |
| 12.4| Performance Testing (DB query optimization, API response time) | Complex | 2 |
| 12.5| Security Audit (SQL injection, XSS, auth vulnerabilities) | Complex | 3 |
| 12.6| Fix Bug (Iteration 1-6 accumulated issues) | Complex | 5 |
| 12.7| Final Evaluation & User Acceptance Testing | Complex | 2 |
| 12.8| Create Report 5: Software Test Document | Complex | 4 |
| **13**| **Closing (02/04/2026 - 21/04/2026)** | | **5** |
| 13.1| Create Report 6: Software User Guides | Medium | 2 |
| 13.2| Create Report 7: Final Project Report | Medium | 3 |
| | **Total Estimated Effort (man-days)** | | **206 man-days** |
