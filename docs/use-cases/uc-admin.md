# Use Case Specifications: Admin Features

**Project:** Torii Nihongo Learning Platform  
**Module:** Admin Features  
**Use Cases:** UC-039 to UC-043  
**Version:** 1.0  
**Date:** January 2026

---

## Table of Contents

1. [UC-039: Manage Users](#uc-039-manage-users)
2. [UC-040: Review Course](#uc-040-review-course)
3. [UC-041: View Transactions](#uc-041-view-transactions)
4. [UC-042: Verify Payment](#uc-042-verify-payment)
5. [UC-043: View System Dashboard](#uc-043-view-system-dashboard)

---

## UC-039: Manage Users

### Primary Actor
- Admin

### Secondary Actor
- Email Service

### Description
As admin, I want to create, view, activate, and deactivate users so that I can manage platform access.

### Trigger
**Navigation path:** Dashboard → Users → Manage

**Direct trigger:** User clicks "Create User" or "Edit User"

### Pre-condition
- User has role: Admin

### Post-condition
- **Create:** New user is created
- **Activate:** User account is activated
- **Deactivate:** User account is deactivated

### Validation Rules
- **VR-USER-001:** Email is required and valid
- **VR-USER-002:** Role must be valid
- **VR-USER-003:** Password is required (for new users)

### Business Rules
- **BR-USER-002:** Email is unique

### Normal Flow (Create User)
1. User clicks "Create User"
2. System displays user creation form
3. User fills in:
   - Email
   - Display name
   - Role
   - Password (temporary)
4. User clicks "Create"
5. System validates input
6. System creates user account
7. System sends welcome email with login credentials
8. System displays success message

### Normal Flow (View Users)
1. User navigates to Users page
2. System displays user list with:
   - Email
   - Name
   - Role
   - Status
   - Last login
3. System displays filters:
   - All Users
   - By Role
   - Active/Inactive
4. System displays search bar
5. System displays pagination

### Normal Flow (Activate User)
1. User clicks "Activate" on inactive user
2. System confirms activation
3. System sets bannedUntil = null
4. System sends activation email
5. System displays success message

### Normal Flow (Deactivate User)
1. User clicks "Deactivate" on active user
2. System displays deactivation form:
   - Reason (optional)
   - Ban duration (optional)
3. User confirms
4. System sets bannedUntil or deletedAt
5. System revokes all user sessions
6. System sends notification email
7. System displays success message

### Alternative Flows

**Alternative Flow A: Reset Password**
- User clicks "Reset Password" on user
- System generates reset link
- System sends email to user

**Alternative Flow B: Change Role**
- User clicks "Change Role"
- System displays role selection
- User selects new role
- System updates user role
- System sends notification email

**Alternative Flow C: View User Activity**
- User clicks "View Activity"
- System displays:
  - Login history
  - Course enrollments
  - Payments
  - Quiz attempts

---

## UC-040: Review Course

### Primary Actor
- Admin

### Secondary Actor
- Email Service
- NATS (for events)

### Description
As admin, I want to approve or reject courses so that only quality content is published.

### Trigger
**Navigation path:** Dashboard → Courses → Pending Approval

**Direct trigger:** User clicks "Review" on pending course

### Pre-condition
- User has role: Admin
- Course status is 'draft' or 'pending'

### Post-condition
- **Approve:** Course is published
- **Reject:** Course remains draft with feedback

### Validation Rules
- None

### Business Rules
- **BR-PUBLISH-002:** Publishing sets status, approvedBy, approvedAt

### Normal Flow (Approve Course)
1. User navigates to pending courses
2. User clicks "Review" on course
3. System displays course preview with:
   - Course details
   - Curriculum
   - Pricing
   - Instructor info
4. User reviews course content
5. User clicks "Approve"
6. System displays confirmation dialog
7. User confirms approval
8. System sets:
   - status = 'published'
   - approvedBy = current user
   - approvedAt = now
9. System emits course.published event
10. System sends approval email to course creator
11. System displays success message

### Normal Flow (Reject Course)
1. User reviews course
2. User clicks "Reject"
3. System displays rejection form:
   - Rejection reason (required)
   - Specific issues (checklist)
   - Suggestions for improvement
4. User enters rejection details
5. User clicks "Submit"
6. System keeps status = 'draft'
7. System saves rejection feedback
8. System sends rejection email to course creator with feedback
9. System displays success message

### Alternative Flows

**Alternative Flow A: Request Changes**
- User clicks "Request Changes"
- User specifies required changes
- System sends feedback to creator
- Course remains in draft
- Creator can resubmit after changes

**Alternative Flow B: Unpublish Course**
- User clicks "Unpublish" on published course
- System confirms action
- System sets status = 'draft'
- System notifies enrolled students
- Course becomes unavailable for new enrollments

---

## UC-041: View Transactions

### Primary Actor
- Admin

### Secondary Actor
- None

### Description
As admin, I want to view all payment transactions so that I can monitor platform revenue.

### Trigger
**Navigation path:** Dashboard → Financial → Transactions

**Direct trigger:** User clicks "Transactions"

### Pre-condition
- User has role: Admin

### Post-condition
- Transaction list is displayed

### Validation Rules
- None

### Business Rules
- None specific

### Normal Flow
1. User navigates to Transactions
2. System retrieves all payments
3. System displays transaction list with:
   - Transaction ID
   - Date
   - User email
   - Course name
   - Amount
   - Payment method
   - Payment gateway
   - Status
   - Gateway transaction ID
4. System displays filters:
   - Date range picker
   - Status filter (All, Completed, Failed, Pending)
   - Payment method filter
   - Payment gateway filter
5. System displays summary cards:
   - Total revenue
   - Successful payments count
   - Failed payments count
   - Pending payments count
   - Average transaction value
6. System displays charts:
   - Revenue over time (line chart)
   - Payment method distribution (pie chart)
   - Success rate trend
7. System displays export button
8. System displays pagination

### Alternative Flows

**Alternative Flow A: Export Transactions**
- User clicks "Export"
- User selects format (CSV, Excel, PDF)
- User selects date range
- System generates report
- System downloads file

**Alternative Flow B: View Transaction Details**
- User clicks on transaction
- System displays modal with:
  - Full transaction details
  - Payment gateway response
  - User information
  - Course information
  - Refund status
  - "Refund" button (if applicable)

**Alternative Flow C: Filter by Date Range**
- User selects date range
- System filters transactions
- System updates summary cards
- System updates charts

---

## UC-042: Verify Payment

### Primary Actor
- Admin, Staff

### Secondary Actor
- Payment Gateway

### Description
As admin/staff, I want to verify payment status so that I can resolve payment issues.

### Trigger
**Navigation path:** Dashboard → Financial → Transactions → Verify

**Direct trigger:** User clicks "Verify" on transaction

### Pre-condition
- User has role: Admin or Staff
- Transaction exists

### Post-condition
- Payment status is verified and updated if needed

### Validation Rules
- None

### Business Rules
- None specific

### Normal Flow
1. User clicks "Verify" on transaction
2. System displays transaction details:
   - Local payment record
   - Payment gateway transaction ID
   - Current status
3. User clicks "Query Gateway"
4. System queries payment gateway for status
5. System displays gateway response:
   - Gateway status
   - Gateway amount
   - Gateway timestamp
6. System compares gateway status with local status
7. If statuses match:
   - System displays "Status verified ✓"
8. If statuses mismatch:
   - System displays discrepancy warning
   - System shows:
     - Local status vs Gateway status
     - Local amount vs Gateway amount
   - System displays "Update Local Status" button
9. User can update local status to match gateway
10. System displays verification result
11. If status changed: System sends notification to user

### Alternative Flows

**Alternative Flow A: Manual Verification**
- User manually marks payment as verified
- User enters verification notes
- User uploads proof (screenshot, receipt)
- System updates payment status
- System logs manual verification

**Alternative Flow B: Gateway Query Failed**
- Gateway API returns error
- System displays error message
- System suggests:
  - Try again later
  - Manual verification
  - Contact gateway support

**Alternative Flow C: Refund Payment**
- User clicks "Refund"
- System displays refund form:
  - Refund amount (full or partial)
  - Refund reason
- User confirms refund
- System initiates refund via gateway
- System updates payment status = 'refunded'
- System revokes course enrollment
- System sends refund notification to user

---

## UC-043: View System Dashboard

### Primary Actor
- Admin

### Secondary Actor
- None

### Description
As admin, I want to view system dashboard so that I can monitor platform health and metrics.

### Trigger
**Navigation path:** Dashboard → System → Overview

**Direct trigger:** User logs in as Admin (default landing page)

### Pre-condition
- User has role: Admin

### Post-condition
- System dashboard is displayed with real-time metrics

### Validation Rules
- None

### Business Rules
- None specific

### Normal Flow
1. User navigates to System Dashboard
2. System retrieves real-time metrics
3. System displays dashboard with:
   
   **Overview Cards:**
   - Total Users (with trend ↑↓)
   - Total Courses (with trend ↑↓)
   - Total Enrollments (with trend ↑↓)
   - Total Revenue (with trend ↑↓)
   - Active Users (last 24h)
   - Active Live Classes
   
   **Charts:**
   - **User Registrations Over Time** (line chart)
     - Daily/Weekly/Monthly view
     - Comparison with previous period
   
   - **Revenue Over Time** (bar chart)
     - Daily/Weekly/Monthly view
     - Breakdown by payment method
   
   - **Course Enrollments by JLPT Level** (pie chart)
     - N5, N4, N3, N2, N1 distribution
   
   - **Active Users** (gauge chart)
     - Current active users
     - Peak concurrent users
   
   - **Quiz Performance** (line chart)
     - Average scores over time
     - Pass rate trend
   
   **Recent Activity:**
   - Latest user registrations (last 10)
   - Latest course purchases (last 10)
   - Latest course publications (last 10)
   - Latest live classes (upcoming)
   
   **System Health:**
   - **Server Status:**
     - Gateway: ✓ Healthy
     - Identity: ✓ Healthy
     - Learning: ✓ Healthy
     - Agents: ✓ Healthy
     - Meet: ✓ Healthy
   
   - **Database Status:**
     - PostgreSQL: ✓ Connected
     - Redis: ✓ Connected
   
   - **External Services:**
     - LiveKit: ✓ Online
     - Storage (S3): ✓ Available
     - Email Service: ✓ Operational
   
   **Performance Metrics:**
   - API Response Time (avg): 120ms
   - Error Rate: 0.5%
   - Active Sessions: 1,234
   - Database Connections: 45/100
   - Cache Hit Rate: 85%
   
4. System auto-refreshes metrics every 30 seconds
5. System displays date range selector
6. User can filter metrics by date range
7. System displays "Export Report" button

### Alternative Flows

**Alternative Flow A: Drill Down**
- User clicks on metric card (e.g., "Total Users")
- System navigates to detailed view
- System displays:
  - Full user list
  - Advanced filters
  - Detailed analytics

**Alternative Flow B: Export Report**
- User clicks "Export Report"
- System displays export dialog:
  - Report type (Overview, Financial, Users, Courses)
  - Date range
  - Format (PDF, Excel, CSV)
- User selects options
- User clicks "Generate"
- System generates comprehensive report with:
  - Summary statistics
  - Charts and graphs
  - Detailed tables
  - Trends and insights
- System downloads report

**Alternative Flow C: System Alert**
- System detects issue:
  - High error rate (>5%)
  - Service down
  - Database connection issues
  - Low disk space
- System displays alert banner:
  - Alert type (Critical, Warning, Info)
  - Alert message
  - Timestamp
- User clicks alert for details
- System shows:
  - Error logs
  - Affected services
  - Suggested actions
  - "Acknowledge" button

**Alternative Flow D: View Logs**
- User clicks "View Logs"
- System displays log viewer:
  - Real-time logs
  - Filter by service
  - Filter by level (Error, Warning, Info)
  - Search functionality
- User can download logs

**Alternative Flow E: Service Management**
- User clicks on service status
- System displays service details:
  - Uptime
  - Last restart
  - Version
  - Health check results
- User can:
  - Restart service (with confirmation)
  - View service logs
  - View service metrics

---

**Last Updated:** 2026-01-12  
**Version:** 1.0  
**Status:** ✅ Complete
