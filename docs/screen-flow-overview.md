# Screen Flow Overview

**Project:** Torii Nihongo Learning Platform  
**Version:** 1.0  
**Last Updated:** 2026-01-14

---

## Overview

Tài liệu này mô tả các luồng màn hình chính cho từng vai trò người dùng trong hệ thống Torii Nihongo, tập trung vào các chức năng cốt lõi.

---

## 1. Admin Flow

### Main Navigation
```mermaid
flowchart TD
    Login[Login] --> Dashboard[Dashboard]
    Dashboard --> Users[User Management]
    Dashboard --> Courses[Course Management]
    Dashboard --> Finance[Finance]
    Dashboard --> QuestionBank[Question Bank]
    Dashboard --> Rooms[Live Rooms]
    Dashboard --> Posts[Posts]
    Dashboard --> Analytics[Analytics]
    Dashboard --> Settings[Settings]
    
    Users --> UserList[Users List]
    UserList --> UserDetail[User Detail]
    UserDetail --> EditUser[Edit/Ban/Change Role]
    
    Courses --> CourseList[Courses List]
    CourseList --> CourseDetail[Course Detail]
    CourseDetail --> Approve[Approve/Publish]
    CourseDetail --> ManageCurriculum[Manage Curriculum]
    
    Finance --> Orders[Orders]
    Finance --> Transactions[Transactions]
    Transactions --> Verify[Verify Payment]
    Transactions --> Refund[Process Refund]
    
    QuestionBank --> Questions[Questions]
    QuestionBank --> Pools[Question Pools]
    Questions --> CreateQ[Create/Edit]
    Pools --> ManagePool[Manage Pools]
    
    Rooms --> RoomList[Rooms List]
    RoomList --> Monitor[Monitor Live Session]
```

### Key Features
- **Dashboard**: System metrics, user stats, revenue overview
- **User Management**: CRUD users, role assignment, ban/activate
- **Course Management**: Approve courses, manage content, publish/unpublish
- **Finance**: View transactions, verify payments, process refunds
- **Question Bank**: Manage questions and pools
- **Live Rooms**: Monitor live sessions
- **Analytics**: System-wide reports

---

## 2. Staff Flow

### Main Navigation
```mermaid
flowchart TD
    Login[Login] --> Dashboard[Dashboard]
    Dashboard --> Courses[Courses]
    Dashboard --> Posts[Posts]
    Dashboard --> QuestionBank[Question Bank]
    Dashboard --> Rooms[Live Classes]
    
    Courses --> CreateCourse[Create Course]
    Courses --> ManageCourses[My Courses]
    CreateCourse --> CourseForm[Course Form]
    CourseForm --> Curriculum[Build Curriculum]
    Curriculum --> AddModules[Add Modules]
    Curriculum --> AddLessons[Add Lessons]
    AddLessons --> UploadContent[Upload Video/Article]
    CourseForm --> Submit[Submit for Review]
    
    Posts --> CreatePost[Create Post]
    Posts --> ManagePosts[Manage Posts]
    CreatePost --> Editor[Rich Editor]
    Editor --> Publish[Publish]
    
    QuestionBank --> ManageQuestions[Manage Questions]
    QuestionBank --> ManagePools[Manage Pools]
    
    Rooms --> Schedule[Schedule Class]
    Rooms --> ViewSchedule[View Schedule]
```

### Key Features
- **Course Management**: Create/edit courses, build curriculum, upload content
- **Post Management**: Create/edit blog posts
- **Question Bank**: Create questions, manage pools
- **Live Classes**: Schedule live sessions

---

## 3. Learner Flow

### Main Navigation
```mermaid
flowchart TD
    Entry[Entry] --> Guest{Guest or Logged In}
    Guest -->|Guest| Home[Home Page]
    Guest -->|Logged In| Dashboard[Dashboard]
    
    Home --> Browse[Browse Courses]
    Browse --> CourseDetail[Course Detail]
    CourseDetail --> Login[Login/Register]
    Login --> Dashboard
    
    Dashboard --> MyCourses[My Courses]
    Dashboard --> BrowseCourses[Browse Courses]
    Dashboard --> LiveClasses[Live Classes]
    Dashboard --> Exams[Exams]
    Dashboard --> Flashcards[Flashcards]
    Dashboard --> Profile[Profile]
    
    MyCourses --> SelectCourse[Select Course]
    SelectCourse --> Learn[Course Player]
    Learn --> WatchVideo[Watch Video]
    Learn --> TakeQuiz[Take Quiz]
    Learn --> ViewProgress[View Progress]
    
    BrowseCourses --> Search[Search/Filter]
    Search --> ViewCourse[View Course]
    ViewCourse --> Enroll[Enroll/Purchase]
    Enroll --> Payment[Payment Gateway]
    Payment --> Success[Success]
    Success --> MyCourses
    
    LiveClasses --> Upcoming[Upcoming Classes]
    Upcoming --> Join[Join Class]
    
    Exams --> TakeExam[Take Exam]
    TakeExam --> Results[View Results]
    
    Flashcards --> Decks[My Decks]
    Decks --> Study[Study Session]
```

### Course Learning Flow
```mermaid
flowchart TD
    MyCourses[My Courses] --> SelectCourse[Select Course]
    SelectCourse --> ViewCurriculum[View Curriculum]
    ViewCurriculum --> SelectLesson[Select Lesson]
    SelectLesson --> CheckLock{Locked?}
    CheckLock -->|No| OpenLesson[Open Lesson]
    CheckLock -->|Yes| ShowMsg[Show Lock Message]
    
    OpenLesson --> LessonType{Type}
    LessonType -->|Video| VideoPlayer[Video Player]
    LessonType -->|Article| ReadArticle[Read Article]
    LessonType -->|Quiz| TakeQuiz[Take Quiz]
    
    VideoPlayer --> TrackProgress[Track Progress]
    TrackProgress --> MarkComplete[Mark Complete]
    MarkComplete --> NextLesson[Next Lesson]
```

### Purchase Flow
```mermaid
flowchart TD
    CourseDetail[Course Detail] --> EnrollBtn[Click Enroll]
    EnrollBtn --> CheckAuth{Logged In?}
    CheckAuth -->|No| LoginPage[Login]
    CheckAuth -->|Yes| CheckPrice{Free?}
    
    CheckPrice -->|Yes| CreateEnroll[Create Enrollment]
    CheckPrice -->|No| Checkout[Checkout Page]
    
    Checkout --> ApplyCoupon[Apply Coupon Optional]
    ApplyCoupon --> SelectPayment[Select Payment Method]
    SelectPayment --> Gateway[Payment Gateway]
    Gateway --> Result{Result}
    Result -->|Success| CreateEnroll
    Result -->|Failed| Retry[Retry]
    
    CreateEnroll --> SendEmail[Send Email]
    SendEmail --> AccessCourse[Access Course]
```

### Quiz Taking Flow
```mermaid
flowchart TD
    QuizList[Quiz List] --> SelectQuiz[Select Quiz]
    SelectQuiz --> QuizInfo[Quiz Info]
    QuizInfo --> Start[Start Quiz]
    Start --> Questions[Answer Questions]
    Questions --> Navigation[Navigate Questions]
    Navigation --> Review[Review Answers]
    Review --> Submit[Submit]
    Submit --> Calculate[Calculate Score]
    Calculate --> ShowResults[Show Results]
    ShowResults --> ViewFeedback[View Feedback]
```

### Key Features
- **Browse & Search**: Find courses by keyword, JLPT level, price
- **Purchase**: Enroll in free/paid courses, apply coupons, payment gateway
- **Learning**: Watch videos, read articles, take quizzes, track progress
- **Live Classes**: Join live sessions with video/audio
- **Exams**: Take JLPT practice tests, view results
- **Flashcards**: Study with spaced repetition
- **Profile**: Manage profile, view payment history, certificates

---

## 4. Lecturer Flow

### Main Navigation
```mermaid
flowchart TD
    Login[Login] --> Dashboard[Dashboard]
    Dashboard --> MyCourses[My Courses]
    Dashboard --> LiveClasses[Live Classes]
    Dashboard --> Assignments[Assignments]
    Dashboard --> Students[Students]
    Dashboard --> Analytics[Analytics]
    
    MyCourses --> ViewCourses[View Assigned Courses]
    ViewCourses --> CourseDetail[Course Details]
    CourseDetail --> ViewEnrollments[View Enrollments]
    CourseDetail --> CourseAnalytics[Course Analytics]
    
    LiveClasses --> Schedule[Schedule Class]
    LiveClasses --> Upcoming[Upcoming Classes]
    LiveClasses --> Past[Past Classes]
    
    Schedule --> ClassForm[Class Details]
    ClassForm --> Create[Create Class]
    
    Upcoming --> StartClass[Start Class]
    StartClass --> LiveRoom[LiveKit Room]
    LiveRoom --> HostControls[Host Controls]
    HostControls --> EndClass[End Class]
    
    Past --> ViewRecording[View Recording]
    Past --> ViewAttendance[View Attendance]
    
    Assignments --> CreateAssignment[Create Assignment]
    Assignments --> ViewSubmissions[View Submissions]
    ViewSubmissions --> Grade[Grade Submission]
    Grade --> Feedback[Provide Feedback]
    
    Students --> StudentList[Student List]
    StudentList --> StudentProgress[View Progress]
```

### Live Class Hosting
```mermaid
flowchart TD
    ClassTime[Class Time] --> Start[Start Class]
    Start --> JoinRoom[Join LiveKit Room]
    JoinRoom --> HostInterface[Host Interface]
    
    HostInterface --> Controls[Controls]
    Controls --> ShareScreen[Share Screen]
    Controls --> Recording[Start/Stop Recording]
    Controls --> ManageParticipants[Manage Participants]
    Controls --> Chat[Moderate Chat]
    Controls --> Polls[Create Polls]
    
    HostInterface --> End[End Class]
    End --> SaveRecording[Save Recording]
    SaveRecording --> Attendance[Calculate Attendance]
    Attendance --> Summary[Send Summary]
```

### Key Features
- **My Courses**: View assigned courses, enrollments, analytics
- **Live Classes**: Schedule, host, manage live sessions with full controls
- **Assignments**: Create assignments, grade submissions, provide feedback
- **Students**: View student list, progress, quiz results
- **Analytics**: Teaching metrics, student performance

---

## 5. Common Features (All Roles)

### Authentication
```mermaid
flowchart TD
    Entry[App Entry] --> Login[Login Page]
    Login --> Credentials[Enter Email & Password]
    Credentials --> Validate{Valid?}
    Validate -->|No| Error[Error]
    Validate -->|Yes| Check2FA{2FA?}
    Check2FA -->|No| Session[Create Session]
    Check2FA -->|Yes| TwoFA[2FA Page]
    TwoFA --> Session
    Session --> Dashboard[Dashboard by Role]
```

### Profile Management
- View/Edit profile information
- Upload avatar
- Change password
- Enable/Disable 2FA
- Manage notification preferences

### Notifications
- Email notifications
- In-app notifications
- Real-time updates
- Notification preferences

---

## 6. Summary by Role

| Role | Primary Focus | Key Screens | Main Actions |
|------|--------------|-------------|--------------|
| **Admin** | System Management | Dashboard, Users, Courses, Finance, Analytics | Manage users, approve content, monitor system, verify payments |
| **Staff** | Content Creation | Courses, Posts, Question Bank, Live Classes | Create courses, write posts, manage questions, schedule classes |
| **Learner** | Learning | Browse, My Courses, Live Classes, Exams, Flashcards | Browse courses, purchase, learn, take quizzes, join live classes |
| **Lecturer** | Teaching | My Courses, Live Classes, Assignments, Students | Conduct classes, grade assignments, track student progress |

---

## 7. Platform Considerations

### Web Application (Desktop)
**Optimized for:**
- Admin Dashboard (data tables, charts)
- Course Creation (rich editor, drag-drop)
- Question Bank Management
- Live Class Hosting (multiple controls)
- Analytics & Reports

### Mobile/Responsive Web
**Optimized for:**
- Course Browsing
- Video Learning
- Live Class Joining (as participant)
- Quiz Taking
- Notifications

### Key Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

---

## 8. Key User Journeys

### Journey 1: New Learner
1. Browse courses → View details → Register → Verify email
2. Choose course → Enroll/Purchase → Complete payment
3. Access course → Start learning → Track progress → Complete → Get certificate

### Journey 2: Lecturer Teaching
1. Login → Schedule live class → Prepare materials
2. Start class → Join LiveKit → Teach students → End class
3. Review attendance → Grade participation → View analytics

### Journey 3: Admin Management
1. Login → View dashboard → Check metrics
2. Review pending courses → Approve/Reject
3. Monitor transactions → Verify payments
4. Manage users → Handle issues

### Journey 4: Staff Content Creation
1. Login → Create course → Add info → Build curriculum
2. Upload videos → Create quizzes → Preview
3. Submit for review → Course approved → Monitor enrollments

---

## Related Documents

- [Detailed Screen Flows](screen-flow-by-roles.md) - Chi tiết đầy đủ
- [Use Case Specifications](srs-06-use-cases.md)
- [User Interface Requirements](srs-04-interfaces.md)
- [System Architecture](srs-03-architecture.md)

---

**Note:** Đây là phiên bản tóm gọn. Xem [screen-flow-by-roles.md](screen-flow-by-roles.md) để có chi tiết đầy đủ về từng flow.
