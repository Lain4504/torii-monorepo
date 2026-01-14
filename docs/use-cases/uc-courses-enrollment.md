# Use Case Specifications: Courses & Enrollment

**Project:** Torii Nihongo Learning Platform  
**Module:** Course Discovery & Enrollment  
**Use Cases:** UC-007 to UC-013  
**Version:** 1.0  
**Date:** January 2026

---

## Table of Contents

1. [UC-007: View Course List](#uc-007-view-course-list)
2. [UC-008: View Course Detail](#uc-008-view-course-detail)
3. [UC-009: Search Course](#uc-009-search-course)
4. [UC-010: Purchase Course](#uc-010-purchase-course)
5. [UC-011: Gift Course](#uc-011-gift-course)
6. [UC-012: View Purchased Courses](#uc-012-view-purchased-courses)
7. [UC-013: View Payment History](#uc-013-view-payment-history)

---

## UC-007: View Course List

### Primary Actor
- Learner (Guest users can also view, but with limited features)

### Secondary Actor
- None

### Description
As a learner, I want to view a list of available courses so that I can browse and find courses that interest me.

### Trigger
**Navigation path:** Home Page → Courses / Browse Courses

**Direct trigger:** User clicks "Courses" or "Browse Courses" in navigation menu

### Pre-condition
- None (public page, accessible to guests)

### Post-condition
- List of published courses is displayed with pagination

### Validation Rules
- **VR-COURSE-LIST-001:** Page number must be positive integer (default: 1)
- **VR-COURSE-LIST-002:** Limit must be positive integer, max 50 (default: 12)

### Business Rules
- **BR-SEARCH-001:** Client search only returns published courses (status = 'published')
- **BR-SEARCH-006:** Soft-deleted courses (deletedAt != null) are excluded from all searches
- **BR-SEARCH-007:** Default pagination: page=1, limit=12 (client)

### Normal Flow
1. User navigates to courses page
2. System retrieves published courses from database:
   - WHERE status = 'published' AND deletedAt IS NULL
   - ORDER BY createdAt DESC
   - LIMIT 12 OFFSET 0
3. System counts total published courses
4. System displays course list with course cards showing:
   - Thumbnail image
   - Course title
   - Short description
   - JLPT level (N5, N4, N3, N2, N1)
   - Price (or "Free" if isFree = true)
   - Discount price (if applicable)
   - Rating (average from reviews)
   - Number of students enrolled
   - Course type (VOD or Live)
5. System displays pagination controls:
   - Current page
   - Total pages
   - Previous/Next buttons
   - Page numbers
6. System displays filters sidebar:
   - JLPT Level (N5, N4, N3, N2, N1)
   - Course Type (VOD, Live)
   - Price Range (slider)
   - Rating (1-5 stars)
7. System displays sort dropdown:
   - Newest
   - Oldest
   - Price: Low to High
   - Price: High to Low
   - Most Popular

### Alternative Flows

**Alternative Flow A: No Courses Found**
- 2a.1. No published courses exist
- 2a.2. System displays empty state:
   - Icon
   - Message: "No courses available yet"
   - "Check back soon" text
- 2a.3. End use case

**Alternative Flow B: User Clicks Course Card**
- 5b.1. User clicks on a course card
- 5b.2. System navigates to Course Detail page (UC-008)
- 5b.3. End use case

**Alternative Flow C: User Changes Page**
- 5c.1. User clicks page number or Next/Previous
- 5c.2. System updates URL query parameter: ?page=2
- 5c.3. System retrieves courses for new page
- 5c.4. System updates course list
- 5c.5. System scrolls to top of page

**Alternative Flow D: User Applies Filters**
- 6d.1. User selects JLPT level filter (e.g., N3)
- 6d.2. System updates URL query: ?jlptLevel=N3
- 6d.3. System retrieves filtered courses
- 6d.4. System updates course list
- 6d.5. System displays active filter tags
- 6d.6. System displays "Clear filters" button

**Alternative Flow E: User Changes Sort**
- 7e.1. User selects sort option (e.g., "Price: Low to High")
- 7e.2. System updates URL query: ?sortBy=price-asc
- 7e.3. System retrieves sorted courses
- 7e.4. System updates course list

---

## UC-008: View Course Detail

### Primary Actor
- Learner (Guest users can also view, but cannot enroll)

### Secondary Actor
- None

### Description
As a learner, I want to view detailed information about a course so that I can decide whether to enroll.

### Trigger
**Navigation path:** Course List → Click course card → Course Detail

**Direct trigger:** User clicks on a course card or course link

### Pre-condition
- Course exists and is published (status = 'published')
- Course is not deleted (deletedAt IS NULL)

### Post-condition
- Course detail page is displayed with all information

### Validation Rules
- **VR-COURSE-DETAIL-001:** Course ID or slug must be valid

### Business Rules
- **BR-CURRICULUM-001:** Curriculum consists of Modules → Lessons hierarchy
- **BR-CURRICULUM-002:** Modules are ordered by orderIndex
- **BR-CURRICULUM-003:** Lessons are ordered by orderIndex within each module
- **BR-CURRICULUM-004:** Preview lessons (isPreview = true) are accessible without enrollment
- **BR-CURRICULUM-005:** Locked lessons (isUnlocked = false) require enrollment

### Normal Flow
1. User clicks on course card or navigates to course URL
2. System extracts course ID or slug from URL
3. System retrieves course data from database
4. System retrieves course curriculum (modules and lessons)
5. System retrieves course instructors
6. System retrieves course reviews (latest 5)
7. System calculates average rating from reviews
8. System checks if user is enrolled (if logged in)
9. System displays course detail page with:
   
   **Header Section:**
   - Course title
   - Short description
   - JLPT level badge
   - Rating (stars) and number of reviews
   - Number of students enrolled
   - Last updated date
   - Course type (VOD or Live)
   
   **Hero Section:**
   - Thumbnail or preview video
   - Price and discount price (if applicable)
   - "Enroll Now" button (or "Go to Course" if already enrolled)
   - "Add to Wishlist" button
   - "Gift this course" link
   
   **Tabs Section:**
   - **Overview Tab:**
     - Full description
     - What you'll learn (learning outcomes)
     - Requirements
     - Who this course is for
   
   - **Curriculum Tab:**
     - List of modules (expandable)
     - Each module shows:
       - Module title
       - Number of lessons
       - Total duration
       - List of lessons (when expanded)
     - Each lesson shows:
       - Lesson title
       - Lesson type (Video, Article, Quiz)
       - Duration
       - Preview badge (if isPreview = true)
       - Lock icon (if isUnlocked = false and not enrolled)
   
   - **Instructors Tab:**
     - Instructor cards with:
       - Avatar
       - Name
       - Bio
       - Number of courses
       - Number of students
   
   - **Reviews Tab:**
     - Rating distribution chart
     - Review list with:
       - Reviewer name and avatar
       - Rating (stars)
       - Review text
       - Review date
     - "Load more" button

10. If user is logged in and enrolled:
    - Change "Enroll Now" to "Go to Course" button
    - Show progress percentage
11. If user is logged in but not enrolled:
    - Show "Enroll Now" button
12. If user is guest (not logged in):
    - Show "Enroll Now" button
    - Clicking redirects to login page

### Alternative Flows

**Alternative Flow A: Course Not Found**
- 3a.1. Course ID/slug does not exist or course is deleted
- 3a.2. System returns 404 error
- 3a.3. System displays "Course not found" page
- 3a.4. System suggests "Browse other courses"
- 3a.5. End use case

**Alternative Flow B: Course Not Published**
- 3b.1. Course status is 'draft' (not published)
- 3b.2. If user is admin or course creator: Show course with "Draft" badge
- 3b.3. If user is learner or guest: Return 404 error
- 3b.4. End use case

**Alternative Flow C: User Clicks Preview Lesson**
- 9c.1. User clicks on a lesson with isPreview = true
- 9c.2. System opens lesson player modal or new page
- 9c.3. User can watch preview without enrollment
- 9c.4. After preview, system shows "Enroll to access full course"

**Alternative Flow D: User Clicks Locked Lesson**
- 9d.1. User clicks on a lesson with isUnlocked = false
- 9d.2. System displays modal: "This lesson is locked. Enroll to access."
- 9d.3. System shows "Enroll Now" button in modal

**Alternative Flow E: User Clicks "Enroll Now"**
- 11e.1. User clicks "Enroll Now" button
- 11e.2. If user is not logged in: Redirect to login page
- 11e.3. If user is logged in: Navigate to Purchase Course page (UC-010)

**Alternative Flow F: User Clicks "Add to Wishlist"**
- 9f.1. User clicks "Add to Wishlist" button
- 9f.2. If not logged in: Redirect to login page
- 9f.3. If logged in: System adds course to user's wishlist
- 9f.4. System displays success message: "Added to wishlist"
- 9f.5. Button changes to "Remove from wishlist"

---

## UC-009: Search Course

### Primary Actor
- Learner (Guest users can also search)

### Secondary Actor
- None

### Description
As a learner, I want to search for courses by keyword so that I can quickly find courses related to specific topics.

### Trigger
**Navigation path:** Any page → Search bar in header

**Direct trigger:** User types in search bar and presses Enter or clicks search icon

### Pre-condition
- None

### Post-condition
- Search results page is displayed with matching courses

### Validation Rules
- **VR-SEARCH-001:** Search query must be at least 2 characters
- **VR-SEARCH-002:** Search query max 100 characters

### Business Rules
- **BR-SEARCH-001:** Client search only returns published courses (status = 'published')
- **BR-SEARCH-003:** Search supports text search in title, description, shortDescription
- **BR-SEARCH-006:** Soft-deleted courses (deletedAt != null) are excluded

### Normal Flow
1. User types search query in search bar
2. User presses Enter or clicks search icon
3. System validates search query (min 2 chars)
4. System navigates to search results page: `/courses?search={query}`
5. System performs full-text search in database:
   - Search in: title, description, shortDescription
   - WHERE status = 'published' AND deletedAt IS NULL
   - AND (title ILIKE '%{query}%' OR description ILIKE '%{query}%' OR shortDescription ILIKE '%{query}%')
   - ORDER BY relevance (title matches first, then description)
6. System displays search results page with:
   - Search query displayed: "Results for '{query}'"
   - Number of results found
   - Course cards (same as UC-007)
   - Filters sidebar (same as UC-007)
   - Sort dropdown (same as UC-007)
   - Pagination
7. System highlights search terms in results (optional)

### Alternative Flows

**Alternative Flow A: No Results Found**
- 5a.1. Search query returns 0 results
- 5a.2. System displays empty state:
   - Icon
   - Message: "No courses found for '{query}'"
   - Suggestions:
     - "Try different keywords"
     - "Browse all courses"
     - "Check spelling"
- 5a.3. System displays "Browse all courses" button
- 5a.4. End use case

**Alternative Flow B: Search Query Too Short**
- 3b.1. Search query is less than 2 characters
- 3b.2. System displays error: "Please enter at least 2 characters"
- 3b.3. Return to step 1

**Alternative Flow C: User Applies Filters to Search**
- 6c.1. User applies filters (JLPT level, price range, etc.)
- 6c.2. System combines search query with filters
- 6c.3. System updates URL: `/courses?search={query}&jlptLevel=N3`
- 6c.4. System retrieves filtered search results
- 6c.5. System updates results list

**Alternative Flow D: Auto-Suggest (Optional)**
- 1d.1. As user types, system shows auto-suggest dropdown
- 1d.2. System performs quick search on course titles
- 1d.3. System displays top 5 matching course titles
- 1d.4. User can click suggestion to go directly to course detail
- 1d.5. Or user can press Enter to see full search results

---

## UC-010: Purchase Course

### Primary Actor
- Learner

### Secondary Actor
- Payment Gateway (VNPay, MoMo, ZaloPay)
- Email Service (for confirmation email)

### Description
As a learner, I want to purchase a course using a payment gateway so that I can enroll and access the course content.

### Trigger
**Navigation path:** Course Detail → Enroll Now → Payment Page

**Direct trigger:** User clicks "Enroll Now" or "Purchase" button on course detail page

### Pre-condition
- User is logged in
- Course exists and is published
- Course is not free (isFree = false)
- User is not already enrolled in the course

### Post-condition
- Payment is created with status 'pending'
- User is redirected to payment gateway
- After successful payment: Enrollment is created
- Confirmation email is sent

### Validation Rules
- **VR-PURCHASE-001:** Course ID is required
- **VR-PURCHASE-002:** Payment method must be valid (vnpay, momo, zalopay, credit_card)
- **VR-PURCHASE-003:** Coupon code format (if provided)

### Business Rules
- **BR-PAY-005:** Free courses cannot create payment (isFree = true)
- **BR-PAY-006:** course_purchase type requires courseId
- **BR-PAY-007:** Payment amount must match course final price
- **BR-ENROLL-001:** User can only enroll once per course

### Normal Flow
1. User clicks "Enroll Now" on course detail page
2. System checks if user is logged in (if not, redirect to login)
3. System checks if user is already enrolled
4. System checks if course is free:
   - If free: Create enrollment directly, skip payment
5. System navigates to payment page
6. System displays payment page with:
   - Course information (title, thumbnail, price)
   - Discount price (if applicable)
   - Coupon code input field
   - Final price
   - Payment method selection (VNPay, MoMo, ZaloPay)
   - Terms and conditions checkbox
7. User optionally enters coupon code
8. If coupon entered:
   - System validates coupon
   - System applies discount
   - System updates final price
9. User selects payment method
10. User checks terms and conditions
11. User clicks "Proceed to Payment" button
12. System creates payment record:
    - userId, amount, currency (VND)
    - paymentMethod, paymentGateway
    - status = 'pending'
    - paymentType = 'course_purchase'
    - enrollmentId = null (will be set after payment)
13. System redirects to payment gateway with payment data
14. User completes payment on gateway
15. Payment gateway processes payment
16. Payment gateway sends webhook to system
17. System verifies webhook signature
18. System updates payment status = 'completed'
19. System creates enrollment:
    - userId, courseId
    - enrollmentDate = now
    - completionStatus = 'in_progress'
    - finalPrice = payment amount
    - paymentId = payment.id
20. System sends confirmation email
21. System redirects user to course page
22. System displays success message: "Enrollment successful! Start learning now."

### Alternative Flows

**Alternative Flow A: Already Enrolled**
- 3a.1. User is already enrolled in course
- 3a.2. System displays message: "You are already enrolled in this course"
- 3a.3. System shows "Go to Course" button
- 3a.4. End use case

**Alternative Flow B: Free Course**
- 4b.1. Course is free (isFree = true)
- 4b.2. System creates enrollment directly (skip payment)
- 4b.3. System sends enrollment confirmation email
- 4b.4. System redirects to course page
- 4b.5. End use case

**Alternative Flow C: Invalid Coupon**
- 8c.1. Coupon code is invalid, expired, or already used
- 8c.2. System displays error: "Invalid coupon code"
- 8c.3. System removes coupon discount
- 8c.4. Return to step 7

**Alternative Flow D: Payment Failed**
- 15d.1. Payment gateway returns failure status
- 15d.2. System receives webhook with failure status
- 15d.3. System updates payment status = 'failed'
- 15d.4. System redirects user to payment page
- 15d.5. System displays error: "Payment failed. Please try again."
- 15d.6. Return to step 6

**Alternative Flow E: Payment Cancelled**
- 14e.1. User cancels payment on gateway
- 14e.2. Gateway redirects back to app
- 14e.3. System updates payment status = 'cancelled'
- 14e.4. System displays message: "Payment cancelled"
- 14e.5. Return to step 6

**Alternative Flow F: Webhook Verification Failed**
- 17f.1. Webhook signature is invalid
- 17f.2. System logs security warning
- 17f.3. System marks payment as suspicious
- 17f.4. System does NOT create enrollment
- 17f.5. System sends alert to admin
- 17f.6. End use case

---

## UC-011: Gift Course

### Primary Actor
- Learner

### Secondary Actor
- Payment Gateway
- Email Service

### Description
As a learner, I want to purchase a course as a gift for another person so that they can access the course content.

### Trigger
**Navigation path:** Course Detail → Gift this course

**Direct trigger:** User clicks "Gift this course" link

### Pre-condition
- User is logged in
- Course exists and is published
- Course is not free

### Post-condition
- Payment is completed
- Gift enrollment is created for recipient
- Gift notification email sent to recipient

### Validation Rules
- **VR-GIFT-001:** Recipient email is required and valid
- **VR-GIFT-002:** Gift message is optional, max 500 characters
- **VR-GIFT-003:** Sender cannot gift to themselves

### Business Rules
- **BR-ENROLL-007:** Gift enrollments set isGift = true and senderId

### Normal Flow
1. User clicks "Gift this course" link
2. System displays gift form with:
   - Recipient email
   - Gift message (optional)
   - Delivery date (optional)
3. User fills in recipient information
4. User proceeds to payment
5. System creates payment with paymentType = 'gift'
6. User completes payment (same as UC-010)
7. System creates enrollment:
   - userId = recipient's userId (or create pending gift)
   - isGift = true
   - senderId = current user's userId
   - giftMessage = user's message
8. System sends gift notification email to recipient
9. System displays success message

### Alternative Flows

**Alternative Flow A: Recipient Not Registered**
- System creates pending gift enrollment
- Recipient receives email with registration link
- After registration, enrollment is activated

**Alternative Flow B: Recipient Already Enrolled**
- System displays error "Recipient is already enrolled in this course"
- Suggest gifting different course

**Alternative Flow C: Self-Gift Attempt**
- System detects sender email = recipient email
- System displays error "You cannot gift a course to yourself"

---

## UC-012: View Purchased Courses

### Primary Actor
- Learner

### Secondary Actor
- None

### Description
As a learner, I want to view all courses I have purchased so that I can access my learning materials.

### Trigger
**Navigation path:** Dashboard → My Courses

**Direct trigger:** User clicks "My Courses" in navigation

### Pre-condition
- User is logged in

### Post-condition
- List of enrolled courses is displayed

### Validation Rules
- None

### Business Rules
- **BR-ENROLL-003:** Enrollment status: in_progress, completed, dropped

### Normal Flow
1. User navigates to "My Courses"
2. System retrieves all enrollments for user
3. System displays course cards with:
   - Course thumbnail
   - Course title
   - Progress percentage
   - Last accessed date
   - "Continue Learning" button
4. System groups courses by status:
   - In Progress
   - Completed
   - Dropped
5. System displays filters:
   - All Courses
   - In Progress
   - Completed

### Alternative Flows

**Alternative Flow A: No Courses**
- System displays empty state
- "Browse Courses" button

**Alternative Flow B: Continue Learning**
- User clicks "Continue Learning"
- System navigates to last accessed lesson

---

## UC-013: View Payment History

### Primary Actor
- Learner

### Secondary Actor
- None

### Description
As a learner, I want to view my payment history so that I can track my course purchases.

### Trigger
**Navigation path:** Dashboard → Settings → Payment History

**Direct trigger:** User clicks "Payment History"

### Pre-condition
- User is logged in

### Post-condition
- Payment history is displayed

### Validation Rules
- None

### Business Rules
- **BR-PAY-002:** Payment status: pending, processing, completed, failed, cancelled

### Normal Flow
1. User navigates to Payment History
2. System retrieves all payments for user
3. System displays payment list with:
   - Date
   - Course name
   - Amount
   - Payment method
   - Status
   - Invoice download button
4. System displays filters:
   - All Payments
   - Completed
   - Failed
5. System displays pagination

### Alternative Flows

**Alternative Flow A: Download Invoice**
- User clicks "Download Invoice"
- System generates PDF invoice
- System downloads invoice to user's device

**Alternative Flow B: No Payment History**
- System displays empty state
- "Browse Courses" button

---

**Last Updated:** 2026-01-12  
**Version:** 1.0  
**Status:** ✅ Complete
