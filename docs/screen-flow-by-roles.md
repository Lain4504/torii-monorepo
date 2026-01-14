# Screen Flow by User Roles

**Project:** Torii Nihongo Learning Platform  
**Version:** 2.0  
**Last Updated:** 2026-01-14

---

## Overview

This document describes the complete screen flows for all user roles in the Torii Nihongo platform. The flows are based on the actual implemented features in the codebase.

**User Roles:**
- **Admin** - System administration and management
- **Staff** - Content creation and course management
- **Learner** - Course consumption and learning
- **Lecturer** - Teaching and live class delivery

---

## 1. Admin Screen Flow

### Entry Point
```mermaid
flowchart TD
    Start[Login Page] --> Auth{Authentication}
    Auth -->|Success| Dashboard[Admin Dashboard]
    Auth -->|2FA Enabled| TwoFA[2FA Verification]
    TwoFA --> Dashboard
```

### Main Navigation Flow
```mermaid
flowchart TD
    Dashboard[Admin Dashboard] --> Users[User Management]
    Dashboard --> Courses[Course Management]
    Dashboard --> Finance[Financial Management]
    Dashboard --> QuestionBank[Question Bank]
    Dashboard --> Rooms[Live Rooms Management]
    Dashboard --> Posts[Content Management]
    Dashboard --> Analytics[Analytics & Reports]
    Dashboard --> Settings[System Settings]
    Dashboard --> Auth[Authorization]
    Dashboard --> AI[AI Services]
    
    %% User Management Branch
    Users --> UsersList[Users List]
    UsersList --> UserDetails[User Details]
    UserDetails --> EditUser[Edit User]
    UserDetails --> ChangeRole[Change User Role]
    UserDetails --> BanUser[Ban/Activate User]
    UserDetails --> ResetPassword[Reset Password]
    
    %% Course Management Branch
    Courses --> CoursesList[Courses List]
    CoursesList --> CourseDetail[Course Details]
    CourseDetail --> EditCourse[Edit Course Info]
    CourseDetail --> ManageModules[Manage Modules]
    ManageModules --> ManageLessons[Manage Lessons]
    CourseDetail --> ApproveCourse[Review & Approve]
    CourseDetail --> PublishCourse[Publish/Unpublish]
    
    %% Financial Management Branch
    Finance --> Orders[Orders List]
    Finance --> Transactions[Payment Transactions]
    Transactions --> TransactionDetails[Transaction Details]
    TransactionDetails --> VerifyPayment[Verify Payment]
    TransactionDetails --> RefundPayment[Process Refund]
    
    %% Question Bank Branch
    QuestionBank --> Questions[Questions Tab]
    QuestionBank --> Pools[Question Pools Tab]
    Questions --> CreateQuestion[Create Question]
    Questions --> EditQuestion[Edit Question]
    Questions --> ImportQuestions[Bulk Import]
    Pools --> CreatePool[Create Pool]
    Pools --> PoolDetails[Pool Details]
    PoolDetails --> AssignQuestions[Assign Questions]
    
    %% Live Rooms Branch
    Rooms --> RoomsList[Rooms List]
    RoomsList --> CreateRoom[Schedule Live Class]
    RoomsList --> MonitorSession[Monitor Session]
    RoomsList --> RoomDetails[Room Details]
    
    %% Content Management Branch
    Posts --> PostsList[Posts List]
    PostsList --> CreatePost[Create Post]
    PostsList --> EditPost[Edit Post]
    PostsList --> PublishPost[Publish Post]
    
    %% Analytics Branch
    Analytics --> SystemMetrics[System Metrics]
    Analytics --> RevenueReports[Revenue Reports]
    Analytics --> UserAnalytics[User Analytics]
    Analytics --> CourseAnalytics[Course Analytics]
    
    %% Authorization Branch
    Auth --> AuditLogs[Audit Logs]
    Auth --> Permissions[Permissions Management]
    
    %% Settings Branch
    Settings --> Profile[Admin Profile]
    Settings --> Notifications[Notifications]
    Settings --> SystemConfig[System Configuration]
    
    %% AI Services Branch
    AI --> AIConfig[AI Configuration]
    AI --> AIMonitoring[AI Usage Monitoring]
```

### Admin Dashboard Details
```mermaid
flowchart LR
    Dashboard[Admin Dashboard] --> Overview[Overview Cards]
    Dashboard --> Charts[Analytics Charts]
    Dashboard --> Recent[Recent Activities]
    
    Overview --> TotalUsers[Total Users]
    Overview --> TotalCourses[Total Courses]
    Overview --> TotalRevenue[Total Revenue]
    Overview --> ActiveSessions[Active Sessions]
    
    Charts --> UserGrowth[User Growth Chart]
    Charts --> RevenueChart[Revenue Trend]
    Charts --> CourseEnroll[Enrollment Stats]
    
    Recent --> RecentUsers[Recent Registrations]
    Recent --> RecentOrders[Recent Orders]
    Recent --> RecentCourses[Recent Courses]
```

### Course Management Detailed Flow
```mermaid
flowchart TD
    CourseList[Course List] --> Filter{Filter/Search}
    Filter --> AllCourses[All Courses]
    Filter --> Published[Published Only]
    Filter --> Draft[Draft Only]
    Filter --> SearchResults[Search Results]
    
    AllCourses --> SelectCourse[Select Course]
    Published --> SelectCourse
    Draft --> SelectCourse
    SearchResults --> SelectCourse
    
    SelectCourse --> CourseDetails[Course Details Page]
    CourseDetails --> Overview[Overview Tab]
    CourseDetails --> Curriculum[Curriculum Tab]
    CourseDetails --> Settings[Settings Tab]
    CourseDetails --> Analytics[Analytics Tab]
    
    Curriculum --> ViewModules[View Modules]
    ViewModules --> AddModule[Add Module]
    ViewModules --> EditModule[Edit Module]
    ViewModules --> DeleteModule[Delete Module]
    ViewModules --> ReorderModules[Reorder Modules]
    
    ViewModules --> ViewLessons[View Lessons]
    ViewLessons --> AddLesson[Add Lesson]
    ViewLessons --> EditLesson[Edit Lesson]
    ViewLessons --> DeleteLesson[Delete Lesson]
    ViewLessons --> ReorderLessons[Reorder Lessons]
```

---

## 2. Staff Screen Flow

### Entry Point
```mermaid
flowchart TD
    Start[Login Page] --> Auth{Authentication}
    Auth -->|Success| Dashboard[Staff Dashboard]
    Auth -->|2FA Enabled| TwoFA[2FA Verification]
    TwoFA --> Dashboard
```

### Main Navigation Flow
```mermaid
flowchart TD
    Dashboard[Staff Dashboard] --> Courses[Course Management]
    Dashboard --> Posts[Blog Management]
    Dashboard --> QuestionBank[Question Bank]
    Dashboard --> Rooms[Live Classes]
    Dashboard --> Orders[Orders]
    Dashboard --> Analytics[Analytics]
    
    %% Course Management
    Courses --> CreateCourse[Create Course]
    Courses --> ManageCourses[Manage Courses]
    ManageCourses --> EditCourse[Edit Course]
    EditCourse --> CourseInfo[Course Information]
    EditCourse --> Curriculum[Curriculum Builder]
    EditCourse --> Pricing[Pricing & Access]
    Curriculum --> AddModules[Add Modules]
    Curriculum --> AddLessons[Add Lessons]
    AddLessons --> UploadVideo[Upload Video]
    AddLessons --> CreateArticle[Create Article]
    AddLessons --> CreateQuiz[Attach Quiz]
    
    %% Blog Management
    Posts --> CreatePost[Create Post]
    Posts --> EditPost[Edit Existing Post]
    Posts --> PublishPost[Publish/Draft]
    CreatePost --> RichEditor[Rich Text Editor]
    RichEditor --> UploadMedia[Upload Images]
    RichEditor --> AddTags[Add Tags]
    
    %% Question Bank
    QuestionBank --> Questions[Question Management]
    QuestionBank --> Pools[Pool Management]
    Questions --> CreateQ[Create Question]
    Questions --> BulkImport[Bulk Import]
    Pools --> CreatePool[Create Pool]
    Pools --> ManagePool[Manage Pools]
    
    %% Live Classes
    Rooms --> ScheduleClass[Schedule Live Class]
    Rooms --> ViewSchedule[View Schedule]
    Rooms --> MonitorLive[Monitor Live Sessions]
    
    %% Orders
    Orders --> ViewOrders[View All Orders]
    Orders --> OrderDetails[Order Details]
    OrderDetails --> ProcessRefund[Process Refund]
```

### Content Creation Flow
```mermaid
flowchart TD
    Start[Content Dashboard] --> CourseOrPost{Content Type}
    
    CourseOrPost -->|Course| CourseFlow[Course Creation Flow]
    CourseOrPost -->|Post| PostFlow[Post Creation Flow]
    
    CourseFlow --> BasicInfo[Enter Basic Info]
    BasicInfo --> UploadThumb[Upload Thumbnail]
    UploadThumb --> SetLevel[Set JLPT Level]
    SetLevel --> SetPrice[Set Pricing]
    SetPrice --> SaveDraft[Save as Draft]
    SaveDraft --> BuildCurriculum[Build Curriculum]
    BuildCurriculum --> AddContent[Add Lessons]
    AddContent --> Preview[Preview Course]
    Preview --> Submit[Submit for Review]
    
    PostFlow --> PostTitle[Enter Title]
    PostTitle --> PostContent[Write Content]
    PostContent --> PostMedia[Add Media]
    PostMedia --> PostTags[Add Tags]
    PostTags --> PostPublish{Publish Now?}
    PostPublish -->|Yes| Published[Published]
    PostPublish -->|No| DraftPost[Save as Draft]
```

---

## 3. Learner Screen Flow

### Entry Point
```mermaid
flowchart TD
    Start[Home Page] --> AuthCheck{Authenticated?}
    AuthCheck -->|No| GuestFlow[Guest Flow]
    AuthCheck -->|Yes| LearnerFlow[Learner Flow]
    
    GuestFlow --> Browse[Browse Courses]
    GuestFlow --> ViewCourse[View Course Details]
    GuestFlow --> LoginPrompt[Login/Register Prompt]
    LoginPrompt --> Login[Login Page]
    LoginPrompt --> Register[Registration Page]
    
    Login --> Success{Auth Success?}
    Success -->|Yes| Dashboard[Learner Dashboard]
    Success -->|No| Login
    
    Register --> Verify[Email Verification]
    Verify --> Dashboard
    
    LearnerFlow --> Dashboard
```

### Main Navigation Flow
```mermaid
flowchart TD
    Dashboard[Learner Dashboard] --> MyCourses[My Courses]
    Dashboard --> Browse[Browse Courses]
    Dashboard --> LiveClasses[Live Classes]
    Dashboard --> Exams[Exams & Tests]
    Dashboard --> Flashcards[Flashcards]
    Dashboard --> Profile[Profile & Settings]
    Dashboard --> Notifications[Notifications]
    Dashboard --> History[Learning History]
    
    %% My Courses Branch
    MyCourses --> InProgress[In Progress]
    MyCourses --> Completed[Completed]
    InProgress --> SelectCourse[Select Course]
    SelectCourse --> CoursePlayer[Course Player]
    CoursePlayer --> WatchLesson[Watch Video Lesson]
    CoursePlayer --> ReadArticle[Read Article]
    CoursePlayer --> TakeQuiz[Take Quiz]
    CoursePlayer --> ViewResources[View Resources]
    CoursePlayer --> Progress[Track Progress]
    
    Completed --> ViewCert[View Certificate]
    Completed --> ReviewCourse[Write Review]
    
    %% Browse Courses Branch
    Browse --> SearchFilter[Search & Filter]
    SearchFilter --> CourseList[Course Catalog]
    CourseList --> CourseDetail[Course Details]
    CourseDetail --> Enroll{Enroll Type}
    Enroll -->|Free| FreeEnroll[Enroll Free]
    Enroll -->|Paid| Checkout[Checkout]
    Checkout --> Payment[Payment Gateway]
    Payment --> Success[Enrollment Success]
    Success --> MyCourses
    
    %% Live Classes Branch
    LiveClasses --> Upcoming[Upcoming Classes]
    LiveClasses --> Past[Past Classes]
    Upcoming --> ClassDetails[Class Details]
    ClassDetails --> JoinClass[Join Live Class]
    JoinClass --> LiveRoom[LiveKit Room]
    LiveRoom --> Participate[Participate]
    LiveRoom --> Chat[Chat]
    LiveRoom --> RaiseHand[Raise Hand]
    Past --> Recording[View Recording]
    
    %% Exams Branch
    Exams --> AvailableExams[Available Exams]
    Exams --> ExamHistory[Exam History]
    AvailableExams --> ExamDetail[Exam Details]
    ExamDetail --> StartExam[Start Exam]
    StartExam --> TakeExam[Take Exam]
    TakeExam --> SubmitExam[Submit Exam]
    SubmitExam --> ViewResults[View Results]
    ViewResults --> ReviewAnswers[Review Answers]
    
    %% Flashcards Branch
    Flashcards --> Decks[My Decks]
    Flashcards --> CreateDeck[Create Deck]
    Decks --> SelectDeck[Select Deck]
    SelectDeck --> StudySession[Study Session]
    StudySession --> FlipCard[Flip Card]
    FlipCard --> RateDifficulty[Rate Difficulty]
    
    %% Profile Branch
    Profile --> EditProfile[Edit Profile]
    Profile --> PaymentHistory[Payment History]
    Profile --> Certificates[My Certificates]
    Profile --> Settings[Account Settings]
    Settings --> Security[Security Settings]
    Settings --> Preferences[Preferences]
```

### Course Learning Flow (Detailed)
```mermaid
flowchart TD
    MyCourses[My Courses] --> SelectCourse[Select Course]
    SelectCourse --> CourseLanding[Course Landing Page]
    
    CourseLanding --> Tabs{Select Tab}
    Tabs --> OverviewTab[Overview]
    Tabs --> ModulesTab[Modules]
    Tabs --> ProgressTab[Progress]
    Tabs --> ResourcesTab[Resources]
    Tabs --> QuizzesTab[Quizzes]
    
    ModulesTab --> ModuleList[Module List]
    ModuleList --> ExpandModule[Expand Module]
    ExpandModule --> LessonList[Lesson List]
    LessonList --> SelectLesson[Select Lesson]
    
    SelectLesson --> LessonCheck{Lesson Unlocked?}
    LessonCheck -->|Yes| OpenLesson[Open Lesson]
    LessonCheck -->|No| LockedMsg[Locked Message]
    
    OpenLesson --> LessonType{Lesson Type}
    LessonType -->|Video| VideoPlayer[Video Player]
    LessonType -->|Article| ArticleReader[Article Reader]
    LessonType -->|Quiz| QuizInterface[Quiz Interface]
    
    VideoPlayer --> Controls[Player Controls]
    Controls --> PlayPause[Play/Pause]
    Controls --> Speed[Playback Speed]
    Controls --> Quality[Quality Selection]
    Controls --> Fullscreen[Fullscreen]
    Controls --> Subtitles[Subtitles]
    
    VideoPlayer --> TrackProgress[Track Progress]
    TrackProgress --> AutoSave[Auto-save Progress]
    AutoSave --> CheckComplete{90% Watched?}
    CheckComplete -->|Yes| MarkComplete[Mark Complete]
    CheckComplete -->|No| Continue[Continue Watching]
    
    MarkComplete --> UpdateProgress[Update Course Progress]
    UpdateProgress --> NextLesson[Show Next Lesson]
    NextLesson --> LessonList
```

### Checkout & Payment Flow
```mermaid
flowchart TD
    CourseDetail[Course Details] --> EnrollBtn[Click Enroll Now]
    EnrollBtn --> CheckAuth{Logged In?}
    CheckAuth -->|No| LoginPage[Redirect to Login]
    CheckAuth -->|Yes| CheckEnrolled{Already Enrolled?}
    
    CheckEnrolled -->|Yes| GoToCourse[Go to Course]
    CheckEnrolled -->|No| CheckPrice{Course Price}
    
    CheckPrice -->|Free| FreeEnroll[Create Enrollment]
    FreeEnroll --> EmailConfirm[Send Email]
    EmailConfirm --> CourseAccess[Access Course]
    
    CheckPrice -->|Paid| CheckoutPage[Checkout Page]
    CheckoutPage --> OrderSummary[Order Summary]
    OrderSummary --> CourseInfo[Course Information]
    OrderSummary --> PriceBreakdown[Price Breakdown]
    OrderSummary --> CouponInput[Coupon Code Input]
    
    CouponInput --> ApplyCoupon{Apply Coupon?}
    ApplyCoupon -->|Yes| ValidateCoupon{Valid?}
    ValidateCoupon -->|Yes| ApplyDiscount[Apply Discount]
    ValidateCoupon -->|No| ShowError[Show Error]
    ShowError --> CouponInput
    ApplyDiscount --> UpdateTotal[Update Total]
    
    ApplyCoupon -->|No| SelectPayment[Select Payment Method]
    UpdateTotal --> SelectPayment
    
    SelectPayment --> PaymentMethod{Method}
    PaymentMethod -->|VNPay| VNPayGateway[VNPay Gateway]
    PaymentMethod -->|MoMo| MoMoGateway[MoMo Gateway]
    PaymentMethod -->|ZaloPay| ZaloPayGateway[ZaloPay Gateway]
    
    VNPayGateway --> ProcessPayment[Process Payment]
    MoMoGateway --> ProcessPayment
    ZaloPayGateway --> ProcessPayment
    
    ProcessPayment --> PaymentResult{Result}
    PaymentResult -->|Success| CreateEnrollment[Create Enrollment]
    PaymentResult -->|Failed| PaymentFailed[Payment Failed]
    PaymentResult -->|Cancelled| PaymentCancelled[Payment Cancelled]
    
    CreateEnrollment --> SendReceipt[Send Receipt Email]
    SendReceipt --> SuccessPage[Success Page]
    SuccessPage --> StartLearning[Start Learning]
    
    PaymentFailed --> RetryPayment[Retry Option]
    RetryPayment --> CheckoutPage
    PaymentCancelled --> CheckoutPage
```

### Quiz Taking Flow
```mermaid
flowchart TD
    QuizList[Available Quizzes] --> SelectQuiz[Select Quiz]
    SelectQuiz --> QuizInfo[Quiz Information]
    QuizInfo --> ShowInfo[Show Details]
    ShowInfo --> NumQuestions[Number of Questions]
    ShowInfo --> TimeLimit[Time Limit]
    ShowInfo --> PassingScore[Passing Score]
    ShowInfo --> Attempts[Attempts Remaining]
    
    QuizInfo --> CheckAttempts{Attempts Left?}
    CheckAttempts -->|No| MaxReached[Max Attempts Reached]
    CheckAttempts -->|Yes| StartBtn[Start Quiz Button]
    
    MaxReached --> ViewHistory[View Previous Results]
    
    StartBtn --> ClickStart[Click Start]
    ClickStart --> CreateAttempt[Create Attempt]
    CreateAttempt --> LoadQuestions[Load Questions]
    LoadQuestions --> QuizInterface[Quiz Interface]
    
    QuizInterface --> QuestionDisplay[Question Display]
    QuestionDisplay --> QuestionNumber[Question X of Y]
    QuestionDisplay --> QuestionText[Question Text]
    QuestionDisplay --> AnswerOptions[Answer Options]
    QuestionDisplay --> FlagBtn[Flag for Review]
    
    QuizInterface --> Timer[Timer Display]
    Timer --> TimeCheck{Time Remaining?}
    TimeCheck -->|Yes| Continue[Continue Quiz]
    TimeCheck -->|No| AutoSubmit[Auto Submit]
    
    QuizInterface --> Navigation[Navigation]
    Navigation --> PrevBtn[Previous Button]
    Navigation --> NextBtn[Next Button]
    Navigation --> QuestionNav[Question Number Nav]
    
    Continue --> AnswerQuestion[Answer Question]
    AnswerQuestion --> AutoSave[Auto-save Answer]
    AutoSave --> NextQuestion{More Questions?}
    NextQuestion -->|Yes| LoadNext[Load Next Question]
    NextQuestion -->|No| ReviewBtn[Review Answers]
    
    LoadNext --> QuestionDisplay
    
    ReviewBtn --> ReviewSummary[Review Summary]
    ReviewSummary --> Answered[Answered Count]
    ReviewSummary --> Unanswered[Unanswered Count]
    ReviewSummary --> Flagged[Flagged Count]
    
    ReviewSummary --> SubmitBtn[Submit Quiz]
    SubmitBtn --> ConfirmSubmit{Confirm?}
    ConfirmSubmit -->|Yes| ProcessSubmit[Process Submission]
    ConfirmSubmit -->|No| QuizInterface
    
    ProcessSubmit --> Calculate[Calculate Score]
    AutoSubmit --> Calculate
    
    Calculate --> MarkAnswers[Mark Correct/Incorrect]
    MarkAnswers --> CalcTotal[Calculate Total Points]
    CalcTotal --> CalcPercentage[Calculate Percentage]
    CalcPercentage --> DeterminePF[Determine Pass/Fail]
    
    DeterminePF --> ShowResults[Show Results]
    ShowResults --> ScoreDisplay[Score & Percentage]
    ShowResults --> PassFailStatus[Pass/Fail Status]
    ShowResults --> Breakdown[Answer Breakdown]
    
    ShowResults --> ResultActions{Actions}
    ResultActions --> ViewFeedback[View Explanations]
    ResultActions --> DownloadPDF[Download Results]
    ResultActions --> RetakeQuiz[Retake Quiz]
    RetakeQuiz --> QuizInfo
```

---

## 4. Lecturer Screen Flow

### Entry Point
```mermaid
flowchart TD
    Start[Login Page] --> Auth{Authentication}
    Auth -->|Success| Dashboard[Lecturer Dashboard]
    Auth -->|2FA Enabled| TwoFA[2FA Verification]
    TwoFA --> Dashboard
```

### Main Navigation Flow
```mermaid
flowchart TD
    Dashboard[Lecturer Dashboard] --> MyCourses[My Courses]
    Dashboard --> LiveClasses[Live Classes]
    Dashboard --> Assignments[Assignments]
    Dashboard --> Students[Students]
    Dashboard --> Materials[Materials]
    Dashboard --> Analytics[Analytics]
    
    %% My Courses Branch
    MyCourses --> AssignedCourses[View Assigned Courses]
    AssignedCourses --> CourseDetails[Course Details]
    CourseDetails --> ViewEnrollments[View Enrollments]
    CourseDetails --> CourseAnalytics[Course Analytics]
    CourseDetails --> ManageContent[Manage Content]
    ManageContent --> EditLessons[Edit Lessons]
    ManageContent --> UploadResources[Upload Resources]
    
    %% Live Classes Branch
    LiveClasses --> Schedule[Schedule New Class]
    LiveClasses --> Upcoming[Upcoming Classes]
    LiveClasses --> Past[Past Classes]
    
    Schedule --> ClassForm[Class Details Form]
    ClassForm --> SetDateTime[Set Date & Time]
    ClassForm --> SetDuration[Set Duration]
    ClassForm --> SelectCourse[Select Course]
    ClassForm --> SetMaxStudents[Set Max Students]
    ClassForm --> CreateClass[Create Class]
    
    Upcoming --> UpcomingDetail[Class Details]
    UpcomingDetail --> StartClass[Start Class]
    StartClass --> LiveRoom[LiveKit Room]
    
    LiveRoom --> HostControls[Host Controls]
    HostControls --> MuteAll[Mute All]
    HostControls --> ShareScreen[Share Screen]
    HostControls --> StartRecording[Start Recording]
    HostControls --> ManageParticipants[Manage Participants]
    HostControls --> EnableChat[Enable/Disable Chat]
    HostControls --> CreatePoll[Create Poll]
    HostControls --> EndClass[End Class]
    
    Past --> PastDetail[Past Class Details]
    PastDetail --> ViewRecording[View Recording]
    PastDetail --> ViewAttendance[View Attendance]
    PastDetail --> ClassStats[Class Statistics]
    
    %% Assignments Branch
    Assignments --> CreateAssignment[Create Assignment]
    Assignments --> ViewSubmissions[View Submissions]
    CreateAssignment --> AssignmentForm[Assignment Form]
    AssignmentForm --> SetDeadline[Set Deadline]
    AssignmentForm --> SetPoints[Set Max Points]
    AssignmentForm --> AttachFiles[Attach Files]
    
    ViewSubmissions --> SubmissionList[Submissions List]
    SubmissionList --> ReviewSubmission[Review Submission]
    ReviewSubmission --> GradeAssignment[Enter Grade]
    ReviewSubmission --> ProvideFeedback[Provide Feedback]
    GradeAssignment --> NotifyStudent[Notify Student]
    
    %% Students Branch
    Students --> StudentList[View Students]
    StudentList --> StudentProfile[Student Profile]
    StudentProfile --> ViewProgress[View Progress]
    StudentProfile --> ViewQuizzes[View Quiz Results]
    StudentProfile --> SendMessage[Send Message]
    
    %% Materials Branch
    Materials --> MaterialsList[My Materials]
    Materials --> UploadNew[Upload New Material]
    MaterialsList --> ShareWithStudents[Share with Students]
    MaterialsList --> OrganizeFolders[Organize in Folders]
    
    %% Analytics Branch
    Analytics --> EngagementMetrics[Engagement Metrics]
    Analytics --> StudentPerformance[Student Performance]
    Analytics --> ClassAttendance[Class Attendance]
    Analytics --> QuizAnalytics[Quiz Analytics]
```

### Live Class Management Flow
```mermaid
flowchart TD
    LiveDashboard[Live Classes Dashboard] --> Actions{Action}
    
    Actions --> Schedule[Schedule New Class]
    Actions --> ViewUpcoming[View Upcoming]
    Actions --> ViewPast[View Past]
    
    Schedule --> Form[Class Details Form]
    Form --> BasicInfo[Enter Basic Info]
    BasicInfo --> Title[Class Title]
    BasicInfo --> Description[Description]
    BasicInfo --> DateTime[Date & Time]
    BasicInfo --> Duration[Duration]
    BasicInfo --> MaxStudents[Max Students]
    BasicInfo --> Course[Link to Course]
    
    Form --> Submit[Create Class]
    Submit --> CreateRoom[Create LiveKit Room]
    CreateRoom --> NotifyStudents[Notify Enrolled Students]
    NotifyStudents --> Confirmation[Confirmation]
    
    ViewUpcoming --> UpcomingList[Upcoming Classes List]
    UpcomingList --> SelectClass[Select Class]
    SelectClass --> ClassDetail[Class Details]
    
    ClassDetail --> TimeCheck{Class Time?}
    TimeCheck -->|Before| Countdown[Show Countdown]
    TimeCheck -->|During| StartBtn[Start Class Button]
    TimeCheck -->|After| Missed[Missed Class]
    
    StartBtn --> JoinRoom[Join LiveKit Room]
    JoinRoom --> HostInterface[Host Interface]
    
    HostInterface --> Video[Video Stream]
    HostInterface --> Audio[Audio Controls]
    HostInterface --> Screen[Screen Share]
    HostInterface --> Controls[Host Controls]
    
    Controls --> Participants[Manage Participants]
    Participants --> MuteUser[Mute/Unmute User]
    Participants --> RemoveUser[Remove User]
    Participants --> PromoteHost[Promote to Co-Host]
    Participants --> SpotlightUser[Spotlight User]
    
    Controls --> Recording[Recording Controls]
    Recording --> StartRec[Start Recording]
    Recording --> StopRec[Stop Recording]
    Recording --> SaveToS3[Save to S3]
    
    Controls --> Chat[Chat Controls]
    Chat --> EnableDisable[Enable/Disable]
    Chat --> ModerateChat[Moderate Messages]
    
    Controls --> Polls[Polls & Quizzes]
    Polls --> CreatePoll[Create Poll]
    Polls --> ViewResults[View Poll Results]
    Polls --> ShareResults[Share Results]
    
    Controls --> EndBtn[End Class Button]
    EndBtn --> ConfirmEnd{Confirm End?}
    ConfirmEnd -->|Yes| StopAll[Stop Recording & Streams]
    ConfirmEnd -->|No| HostInterface
    
    StopAll --> SaveRecording[Save Recording]
    SaveRecording --> CalcAttendance[Calculate Attendance]
    CalcAttendance --> Summary[Class Summary]
    Summary --> EmailSummary[Email Summary to Participants]
    
    ViewPast --> PastList[Past Classes List]
    PastList --> PastDetail[Past Class Details]
    PastDetail --> AttendanceReport[Attendance Report]
    PastDetail --> RecordingLink[Recording Link]
    PastDetail --> ClassMetrics[Class Metrics]
```

### Assignment Grading Flow
```mermaid
flowchart TD
    AssignmentDash[Assignments Dashboard] --> ViewAll[View All Assignments]
    ViewAll --> FilterAssignments{Filter}
    FilterAssignments --> AllAssignments[All]
    FilterAssignments --> Active[Active]
    FilterAssignments --> Closed[Closed]
    
    AllAssignments --> SelectAssignment[Select Assignment]
    Active --> SelectAssignment
    Closed --> SelectAssignment
    
    SelectAssignment --> AssignmentDetail[Assignment Details]
    AssignmentDetail --> Submissions[View Submissions]
    
    Submissions --> SubmissionList[Submissions List]
    SubmissionList --> FilterSubs{Filter Submissions}
    FilterSubs --> AllSubs[All]
    FilterSubs --> Submitted[Submitted]
    FilterSubs --> Late[Late]
    FilterSubs --> NotSubmitted[Not Submitted]
    FilterSubs --> Graded[Graded]
    
    AllSubs --> SelectSubmission[Select Submission]
    Submitted --> SelectSubmission
    Late --> SelectSubmission
    Graded --> SelectSubmission
    
    SelectSubmission --> ReviewInterface[Review Interface]
    ReviewInterface --> StudentWork[Student's Work]
    ReviewInterface --> SubmittedFiles[Submitted Files]
    ReviewInterface --> SubmissionInfo[Submission Info]
    
    ReviewInterface --> GradeSection[Grading Section]
    GradeSection --> EnterGrade[Enter Grade]
    EnterGrade --> ValidateGrade{Valid Grade?}
    ValidateGrade -->|Yes| SaveGrade[Save Grade]
    ValidateGrade -->|No| ErrorMsg[Show Error]
    ErrorMsg --> EnterGrade
    
    GradeSection --> FeedbackArea[Feedback]
    FeedbackArea --> WriteFeedback[Write Comments]
    FeedbackArea --> AttachRubric[Attach Rubric]
    
    SaveGrade --> Notification[Send Notification]
    Notification --> StudentEmail[Email to Student]
    StudentEmail --> NextSubmission{More Submissions?}
    NextSubmission -->|Yes| SelectSubmission
    NextSubmission -->|No| Complete[Grading Complete]
```

---

## 5. Common Flows (All Roles)

### Authentication Flow
```mermaid
flowchart TD
    Entry[Application Entry] --> CheckAuth{Authenticated?}
    CheckAuth -->|Yes| CheckRole{User Role?}
    CheckAuth -->|No| LoginPage[Login Page]
    
    LoginPage --> Credentials[Enter Email & Password]
    Credentials --> Submit[Submit Login]
    Submit --> Validate{Valid Credentials?}
    
    Validate -->|No| ErrorMsg[Show Error]
    ErrorMsg --> LoginPage
    
    Validate -->|Yes| Check2FA{2FA Enabled?}
    Check2FA -->|No| CreateSession[Create Session]
    Check2FA -->|Yes| TwoFAPage[2FA Verification]
    
    TwoFAPage --> EnterCode[Enter 2FA Code]
    EnterCode --> VerifyCode{Code Valid?}
    VerifyCode -->|No| TwoFAError[Show Error]
    TwoFAError --> TwoFAPage
    VerifyCode -->|Yes| CreateSession
    
    CreateSession --> CheckRole
    
    CheckRole -->|Admin| AdminDash[Admin Dashboard]
    CheckRole -->|Staff| StaffDash[Staff Dashboard]
    CheckRole -->|Learner| LearnerDash[Learner Dashboard]
    CheckRole -->|Lecturer| LecturerDash[Lecturer Dashboard]
```

### Profile Management Flow
```mermaid
flowchart TD
    ProfileMenu[Profile Menu] --> ViewProfile[View Profile]
    ProfileMenu --> EditProfile[Edit Profile]
    ProfileMenu --> Security[Security Settings]
    ProfileMenu --> Notifications[Notification Preferences]
    ProfileMenu --> Logout[Logout]
    
    EditProfile --> BasicInfo[Basic Information]
    BasicInfo --> Name[Display Name]
    BasicInfo --> Email[Email]
    BasicInfo --> Phone[Phone Number]
    BasicInfo --> Avatar[Upload Avatar]
    BasicInfo --> Bio[Bio/Description]
    
    BasicInfo --> Save[Save Changes]
    Save --> Validate{Valid?}
    Validate -->|Yes| Update[Update Profile]
    Validate -->|No| ShowErrors[Show Validation Errors]
    Update --> Success[Success Message]
    
    Security --> ChangePassword[Change Password]
    Security --> Enable2FA[Enable 2FA]
    Security --> Sessions[Active Sessions]
    
    ChangePassword --> CurrentPwd[Enter Current Password]
    CurrentPwd --> NewPwd[Enter New Password]
    NewPwd --> ConfirmPwd[Confirm Password]
    ConfirmPwd --> PasswordSubmit[Submit]
    PasswordSubmit --> PwdValidate{Valid?}
    PwdValidate -->|Yes| UpdatePwd[Update Password]
    PwdValidate -->|No| PwdError[Show Error]
    
    Enable2FA --> Generate[Generate QR Code]
    Generate --> ScanQR[Scan with App]
    ScanQR --> VerifySetup[Verify Setup]
    VerifySetup --> Enable[Enable 2FA]
    
    Notifications --> EmailNotif[Email Notifications]
    Notifications --> PushNotif[Push Notifications]
    Notifications --> Preferences[Notification Types]
    Preferences --> SavePrefs[Save Preferences]
```

### Notification System
```mermaid
flowchart TD
    NotifCenter[Notification Center] --> UnreadCount[Unread Count Badge]
    NotifCenter --> NotifList[Notifications List]
    
    NotifList --> FilterNotifs{Filter}
    FilterNotifs --> All[All Notifications]
    FilterNotifs --> Unread[Unread Only]
    FilterNotifs --> ByType[By Type]
    
    All --> DisplayNotifs[Display Notifications]
    Unread --> DisplayNotifs
    ByType --> DisplayNotifs
    
    DisplayNotifs --> NotifItem[Notification Item]
    NotifItem --> NotifIcon[Icon by Type]
    NotifItem --> NotifMessage[Message]
    NotifItem --> NotifTime[Timestamp]
    NotifItem --> NotifActions[Actions]
    
    NotifActions --> MarkRead[Mark as Read]
    NotifActions --> Delete[Delete]
    NotifActions --> ClickAction[Click Action]
    
    ClickAction --> Navigate[Navigate to Related Page]
    Navigate --> CourseNotif[Course Updates]
    Navigate --> PaymentNotif[Payment Notifications]
    Navigate --> LiveClassNotif[Live Class Reminders]
    Navigate --> SystemNotif[System Announcements]
```

---

## 6. Screen Flow Summary by Role

### Admin Focus Areas
- **Primary Screens**: Dashboard, Users, Courses, Transactions, Question Bank, Analytics
- **Key Actions**: Manage users, approve courses, verify payments, monitor system health
- **Access Level**: Full system access, all CRUD operations
- **Dashboard Type**: System-wide metrics and analytics

### Staff Focus Areas
- **Primary Screens**: Courses, Posts, Question Bank, Live Classes, Orders
- **Key Actions**: Create courses, manage content, handle questions, schedule classes
- **Access Level**: Content management and user support
- **Dashboard Type**: Content and course statistics

### Learner Focus Areas
- **Primary Screens**: My Courses, Browse Courses, Live Classes, Exams, Flashcards
- **Key Actions**: Browse, purchase, learn, take quizzes, join live classes
- **Access Level**: Personal learning progress and content consumption
- **Dashboard Type**: Personal learning progress and recommendations

### Lecturer Focus Areas
- **Primary Screens**: My Courses, Live Classes, Assignments, Students, Analytics
- **Key Actions**: Conduct live classes, grade assignments, track student progress
- **Access Level**: Assigned courses and enrolled students
- **Dashboard Type**: Teaching analytics and student performance

---

## 7. Mobile vs Web Considerations

### Mobile-First Screens (All Roles)
- Login/Register
- Dashboard (simplified layout)
- Course Catalog (touch-optimized)
- My Courses (swipe navigation)
- Live Class Join (mobile-optimized video)
- Notifications

### Web-Optimized Screens
- Admin Dashboard (complex data tables)
- Course Creation/Editing (rich text editor, drag-drop)
- Quiz Builder (complex interface)
- Live Class Host Controls (multiple panels)
- Analytics & Reports (charts, graphs)
- Question Bank Management (bulk operations)

### Responsive Breakpoints
- **Mobile**: < 768px (simplified navigation, stacked layout)
- **Tablet**: 768px - 1024px (sidebar navigation, grid layout)
- **Desktop**: > 1024px (full navigation, multi-column layout)

---

## 8. Key User Journeys

### Journey 1: New Learner Onboarding
1. Visit homepage → Browse courses → View course details
2. Register account → Verify email
3. Return to course → Enroll/Purchase
4. Complete payment → Access course
5. Start first lesson → Track progress
6. Complete course → Download certificate

### Journey 2: Lecturer Teaching a Live Class
1. Login → Navigate to Live Classes
2. Schedule new class → Set details → Create
3. Prepare materials → Upload to Materials
4. Class time → Start class → Join LiveKit room
5. Teach students → Share screen → Interact via chat
6. End class → Save recording → View attendance
7. Review class metrics → Grade participation

### Journey 3: Admin Managing System
1. Login → View dashboard → Check system health
2. Review pending courses → Approve/Reject
3. Monitor live sessions → Check for issues
4. View payment transactions → Verify payments
5. Manage users → Handle support tickets
6. Review analytics → Generate reports
7. Configure system settings

### Journey 4: Staff Creating Content
1. Login → Navigate to Courses
2. Create new course → Add basic info
3. Build curriculum → Add modules and lessons
4. Upload videos → Create articles
5. Create quizzes → Add to lessons
6. Preview course → Submit for approval
7. Course approved → Monitor enrollments

---

## Related Documents

- [Use Case Specifications](srs-06-use-cases.md)
- [User Interface Requirements](srs-04-interfaces.md)
- [System Architecture](srs-03-architecture.md)
- [Admin Use Cases](use-cases/uc-admin.md)
- [Staff Use Cases](use-cases/uc-staff.md)
- [Lecturer Use Cases](use-cases/uc-lecturer.md)
- [Learning & Assessments Use Cases](use-cases/uc-learning-assessments.md)
- [Courses & Enrollment Use Cases](use-cases/uc-courses-enrollment.md)
- [Flashcards & Community Use Cases](use-cases/uc-flashcards-community.md)
- [Live Classes (Learner) Use Cases](use-cases/uc-live-classes-learner.md)

---

**Version History:**
- **v1.0** (2026-01-11): Initial version with basic screen flows
- **v2.0** (2026-01-14): Complete rewrite based on actual codebase implementation
