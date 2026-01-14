# Use Case Specifications: Live Classes (Learner)

**Project:** Torii Nihongo Learning Platform  
**Module:** Live Classes - Learner Features  
**Use Cases:** UC-019 to UC-022  
**Version:** 1.0  
**Date:** January 2026

---

## Table of Contents

1. [UC-019: Register Live Online Classes](#uc-019-register-live-online-classes)
2. [UC-020: View Class Schedules](#uc-020-view-class-schedules)
3. [UC-021: Join Live Class](#uc-021-join-live-class)
4. [UC-022: Access Class Materials](#uc-022-access-class-materials)

---

## UC-019: Register Live Online Classes

### Primary Actor
- Learner

### Secondary Actor
- Email Service
- Calendar Service

### Description
As a learner, I want to register for live online classes so that I can attend real-time lessons.

### Trigger
**Navigation path:** Course → Live Classes → Register

**Direct trigger:** User clicks "Register for Live Class"

### Pre-condition
- User is enrolled in course
- Live class has available seats
- Live class has not started

### Post-condition
- User is registered for live class
- Confirmation email sent
- Calendar invite sent

### Validation Rules
- None

### Business Rules
- **BR-ROOM-002:** Room status tracking

### Normal Flow
1. User views live class schedule in course
2. System displays upcoming live classes with:
   - Class title
   - Date and time
   - Duration
   - Instructor name
   - Available seats (e.g., "15/30 seats available")
   - "Register" button
3. User clicks "Register" for a class
4. System checks available seats
5. System displays registration confirmation dialog:
   - Class details
   - Date/time in user's timezone
   - "Confirm Registration" button
6. User confirms registration
7. System creates class registration record
8. System decrements available seats
9. System sends confirmation email with:
   - Class details
   - Join link
   - Calendar invite (.ics file)
   - Preparation instructions
10. System displays success message: "Registration successful!"
11. System adds class to user's schedule
12. System sends reminder notifications:
    - 24 hours before class
    - 1 hour before class
    - 10 minutes before class

### Alternative Flows

**Alternative Flow A: Class Full**
- 4a.1. No available seats remaining
- 4a.2. System displays "Class is full"
- 4a.3. System offers "Join Waitlist" option
- 4a.4. If user joins waitlist:
   - System adds to waitlist
   - System notifies if seat becomes available
- 4a.5. End use case

**Alternative Flow B: Already Registered**
- 3b.1. User is already registered for this class
- 3b.2. System displays "You are already registered"
- 3b.3. System shows "View Details" button
- 3b.4. System shows "Cancel Registration" button
- 3b.5. End use case

**Alternative Flow C: Schedule Conflict**
- 6c.1. User has another class at same time
- 6c.2. System displays warning: "You have a schedule conflict"
- 6c.3. System shows conflicting class details
- 6c.4. User can still proceed or cancel

**Alternative Flow D: Cancel Registration**
- User clicks "Cancel Registration"
- System displays confirmation dialog
- User confirms cancellation
- System deletes registration
- System increments available seats
- System sends cancellation email

---

## UC-020: View Class Schedules

### Primary Actor
- Learner

### Secondary Actor
- None

### Description
As a learner, I want to view my class schedules so that I know when to attend live classes.

### Trigger
**Navigation path:** Dashboard → My Schedule

**Direct trigger:** User clicks "My Schedule"

### Pre-condition
- User is logged in

### Post-condition
- Class schedule is displayed in calendar view

### Validation Rules
- None

### Business Rules
- None specific

### Normal Flow
1. User navigates to "My Schedule"
2. System retrieves all registered live classes
3. System displays calendar with view options:
   - Month view
   - Week view
   - Day view
   - List view
4. System shows class cards with:
   - Class title
   - Date and time (in user's timezone)
   - Duration
   - Instructor name and avatar
   - Course name
   - Status badge:
     - "Upcoming" (green)
     - "In Progress" (blue)
     - "Completed" (gray)
   - "Join Class" button (if class is live or starting soon)
   - "View Details" button
5. System displays filters:
   - All Classes
   - Upcoming
   - Past
   - By Course
6. System displays timezone selector
7. System color-codes classes by course
8. System displays "Export to Calendar" button

### Alternative Flows

**Alternative Flow A: No Scheduled Classes**
- 2a.1. User has no registered live classes
- 2a.2. System displays empty state:
   - Icon
   - Message: "No scheduled classes"
   - "Browse Live Classes" button
- 2a.3. End use case

**Alternative Flow B: Export to Calendar**
- 8b.1. User clicks "Export to Calendar"
- 8b.2. System generates .ics file with all classes
- 8b.3. System downloads file
- 8b.4. User can import to Google Calendar, Outlook, etc.

**Alternative Flow C: View Class Details**
- User clicks "View Details"
- System displays modal with:
   - Full class description
   - Instructor bio
   - Prerequisites
   - Materials needed
   - Join link
   - Cancel registration option

---

## UC-021: Join Live Class

### Primary Actor
- Learner

### Secondary Actor
- LiveKit Server
- NATS (for auth callout)

### Description
As a learner, I want to join live classes so that I can participate in real-time lessons.

### Trigger
**Navigation path:** My Schedule → Join Class

**Direct trigger:** User clicks "Join Class" button

**Timing trigger:** 10 minutes before class start, system sends notification

### Pre-condition
- User is registered for live class
- Class has started or is about to start (within 10 minutes)
- User has webcam and microphone permissions

### Post-condition
- User joins LiveKit room
- Attendance is recorded
- User can see/hear instructor and other participants

### Validation Rules
- None

### Business Rules
- **BR-LIVEKIT-003:** Room access requires valid enrollment or instructor role

### Normal Flow
1. User receives notification: "Class starting in 10 minutes"
2. User clicks notification or navigates to schedule
3. User clicks "Join Class" button
4. System checks if class has started
5. System displays pre-join screen:
   - Camera preview
   - Microphone test
   - Audio/video settings
   - "Join with video" toggle
   - "Join with audio" toggle
6. User configures settings
7. User clicks "Join Now"
8. System requests room access token from Meet Service
9. Meet Service validates enrollment
10. Meet Service requests auth from Gateway via NATS
11. Gateway validates JWT token
12. Gateway returns auth response
13. Meet Service generates LiveKit token with permissions:
    - canPublish: true (audio/video)
    - canSubscribe: true
    - canPublishData: true (chat)
14. System redirects to LiveKit room
15. User's browser connects to LiveKit server
16. LiveKit validates token via NATS auth callout
17. User joins room successfully
18. System records attendance:
    - joinedAt timestamp
    - attendanceStatus = 'attended'
19. System displays live class interface:
    - Main video area (instructor)
    - Participant grid (other students)
    - Chat panel
    - Controls:
      - Mute/unmute microphone
      - Turn on/off camera
      - Share screen
      - Raise hand
      - Leave class
20. User participates in class
21. System tracks participation:
    - Duration in class
    - Interactions (chat messages, raised hand)
22. When user leaves:
    - System records leftAt timestamp
    - System calculates total duration

### Alternative Flows

**Alternative Flow A: Class Not Started**
- 4a.1. Class start time is more than 10 minutes away
- 4a.2. System displays countdown timer
- 4a.3. "Join" button is disabled
- 4a.4. System shows: "Class starts in X minutes"
- 4a.5. System enables button 10 minutes before start

**Alternative Flow B: Class Ended**
- 4b.1. Class has already ended
- 4b.2. System displays "Class has ended"
- 4b.3. System shows "View Recording" button
- 4b.4. System displays class summary
- 4b.5. End use case

**Alternative Flow C: Connection Failed**
- 15c.1. LiveKit connection fails
- 15c.2. System displays error message
- 15c.3. System offers troubleshooting steps:
   - Check internet connection
   - Refresh browser
   - Try different browser
   - Contact support
- 15c.4. System provides "Retry" button

**Alternative Flow D: Permission Denied**
- 6d.1. Browser blocks camera/microphone access
- 6d.2. System displays permission request
- 6d.3. System shows instructions to enable permissions
- 6d.4. User can join with audio/video off

**Alternative Flow E: Late Join**
- 4e.1. User joins after class started
- 4e.2. System marks as "late" in attendance
- 4e.3. User still joins successfully
- 4e.4. System records actual join time

**Alternative Flow F: Network Issues During Class**
- 20f.1. User's connection becomes unstable
- 20f.2. System displays "Poor connection" warning
- 20f.3. System automatically reduces video quality
- 20f.4. If disconnected: System attempts auto-reconnect
- 20f.5. User can manually reconnect

---

## UC-022: Access Class Materials

### Primary Actor
- Learner

### Secondary Actor
- File Storage Service (S3/MinIO)

### Description
As a learner, I want to access class materials so that I can review lesson content.

### Trigger
**Navigation path:** Course → Live Class → Materials

**Direct trigger:** User clicks "Class Materials"

### Pre-condition
- User is enrolled in course
- Instructor has uploaded materials

### Post-condition
- Materials list is displayed
- User can download materials

### Validation Rules
- None

### Business Rules
- **BR-MATERIAL-001:** Material types: slides, video, reading, assignment

### Normal Flow
1. User navigates to live class page
2. User clicks "Materials" tab
3. System retrieves materials for live class
4. System displays materials list with:
   - Material icon (based on type)
   - Material title
   - Type (Slides, Video, Reading, Assignment)
   - File size
   - Upload date
   - Instructor name
   - Download button
   - Preview button (for supported types)
5. Materials are organized by:
   - Pre-class materials (preparation)
   - Class materials (during class)
   - Post-class materials (homework, review)
6. User clicks download button
7. System checks if user is enrolled
8. System generates presigned URL (15 minutes expiry)
9. System initiates download to user's device
10. System tracks download (analytics)

### Alternative Flows

**Alternative Flow A: No Materials**
- 3a.1. Instructor has not uploaded any materials
- 3a.2. System displays empty state:
   - Icon
   - Message: "No materials available yet"
   - "Materials will be added by instructor"
- 3a.3. End use case

**Alternative Flow B: View Online**
- 5b.1. User clicks "Preview" button
- 5b.2. For PDF/slides:
   - System opens in browser PDF viewer
   - User can view without downloading
- 5b.3. For videos:
   - System opens in video player
   - User can watch online
- 5b.4. For documents:
   - System opens in document viewer

**Alternative Flow C: Material Locked**
- 7c.1. Material is marked as "post-class only"
- 7c.2. Class has not ended yet
- 7c.3. System displays: "This material will be available after class"
- 7c.4. End use case

**Alternative Flow D: Download Failed**
- 9d.1. S3/MinIO returns error
- 9d.2. System displays error: "Download failed. Please try again."
- 9d.3. System provides "Retry" button
- 9d.4. System logs error for admin review

**Alternative Flow E: Bulk Download**
- User clicks "Download All Materials"
- System creates ZIP file with all materials
- System generates presigned URL for ZIP
- System downloads ZIP file
- System displays progress indicator

**Alternative Flow F: Material Upload (Instructor)**
- Instructor uploads new material during/after class
- System notifies enrolled students
- Material appears in list immediately
- Students receive email notification

---

**Last Updated:** 2026-01-12  
**Version:** 1.0  
**Status:** ✅ Complete
