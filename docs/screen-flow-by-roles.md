# Screen Flow by User Roles

## 1. Admin Screen Flow

```mermaid
flowchart TD
    A[Login] --> B[Admin Dashboard]
    B --> C[User Management]
    B --> D[Payment Management]
    B --> E[System Settings]
    B --> F[Reports & Analytics]
    
    C --> C1[View Users List]
    C1 --> C2[Search/Filter Users]
    C2 --> C3[View User Details]
    C3 --> C4[Edit User]
    C3 --> C5[Ban/Activate User]
    C3 --> C6[Change Role]
    C3 --> C7[View Audit Logs]
    
    D --> D1[View Payments]
    D1 --> D2[Payment Details]
    D2 --> D3[Refund Payment]
    D1 --> D4[Payment Reports]
    
    E --> E1[RBAC Settings]
    E --> E2[System Config]
    E --> E3[Email Templates]
    
    F --> F1[Revenue Reports]
    F --> F2[User Analytics]
    F --> F3[Course Analytics]
```

## 2. Staff Screen Flow

```mermaid
flowchart TD
    A[Login] --> B[Staff Dashboard]
    B --> C[Course Management]
    B --> D[Quiz Management]
    B --> E[Content Management]
    B --> F[Support]
    
    C --> C1[View Courses]
    C1 --> C2[Create Course]
    C1 --> C3[Edit Course]
    C3 --> C4[Manage Modules]
    C4 --> C5[Manage Lessons]
    C5 --> C6[Upload Video]
    C5 --> C7[Add Article]
    C3 --> C8[Set Pricing]
    C3 --> C9[Publish/Unpublish]
    
    D --> D1[Question Bank]
    D1 --> D2[Create Question]
    D1 --> D3[Edit Question]
    D1 --> D4[Import Questions]
    D --> D5[Create Quiz]
    D5 --> D6[Configure Quiz]
    D6 --> D7[Assign to Course]
    
    E --> E1[Blog Posts]
    E --> E2[Announcements]
    E --> E3[Media Library]
    
    F --> F1[Support Tickets]
    F --> F2[User Inquiries]
```

## 3. Learner Screen Flow

```mermaid
flowchart TD
    A[Login/Register] --> B[Learner Dashboard]
    B --> C[Browse Courses]
    B --> D[My Courses]
    B --> E[Live Classes]
    B --> F[Quizzes]
    B --> G[Profile]
    
    C --> C1[Course Catalog]
    C1 --> C2[Filter/Search]
    C2 --> C3[Course Details]
    C3 --> C4[Add to Wishlist]
    C3 --> C5[Enroll/Purchase]
    C5 --> C6[Apply Coupon]
    C6 --> C7[Payment]
    C7 --> C8[Payment Success]
    C8 --> D
    
    D --> D1[View Enrolled Courses]
    D1 --> D2[Select Course]
    D2 --> D3[View Modules]
    D3 --> D4[Watch Lesson]
    D4 --> D5[Mark Complete]
    D5 --> D6[Next Lesson]
    D2 --> D7[View Progress]
    
    E --> E1[Upcoming Classes]
    E1 --> E2[Class Details]
    E2 --> E3[Join Class]
    E3 --> E4[LiveKit Room]
    E1 --> E5[Past Classes]
    E5 --> E6[View Recording]
    
    F --> F1[Available Quizzes]
    F1 --> F2[Quiz Details]
    F2 --> F3[Start Quiz]
    F3 --> F4[Answer Questions]
    F4 --> F5[Submit Quiz]
    F5 --> F6[View Results]
    F6 --> F7[Review Answers]
    F1 --> F8[Quiz History]
    
    G --> G1[Edit Profile]
    G --> G2[Payment History]
    G --> G3[Certificates]
    G --> G4[Settings]
```

## 4. Lecturer Screen Flow

```mermaid
flowchart TD
    A[Login] --> B[Lecturer Dashboard]
    B --> C[My Courses]
    B --> D[Live Classes]
    B --> E[Materials]
    B --> F[Students]
    
    C --> C1[View Assigned Courses]
    C1 --> C2[Course Details]
    C2 --> C3[View Enrollments]
    C2 --> C4[View Analytics]
    
    D --> D1[Schedule Live Class]
    D1 --> D2[Set Details]
    D2 --> D3[Select Course]
    D3 --> D4[Create Class]
    D --> D5[Upcoming Classes]
    D5 --> D6[Class Details]
    D6 --> D7[Start Class]
    D7 --> D8[LiveKit Room]
    D8 --> D9[Share Screen]
    D8 --> D10[Manage Participants]
    D8 --> D11[End Class]
    D5 --> D12[Past Classes]
    D12 --> D13[View Recording]
    D12 --> D14[View Attendance]
    
    E --> E1[Upload Materials]
    E --> E2[Manage Files]
    E --> E3[Share with Students]
    
    F --> F1[View Students]
    F1 --> F2[Student Progress]
    F1 --> F3[Send Messages]
```

## Screen Flow Summary by Role

### Admin
- **Primary Focus**: System administration, user management, payments
- **Key Screens**: Dashboard, User Management, Payment Management, Reports
- **Main Actions**: Manage users, view reports, configure system

### Staff
- **Primary Focus**: Content creation and management
- **Key Screens**: Course Management, Quiz Management, Content Management
- **Main Actions**: Create courses, manage quizzes, handle support

### Learner
- **Primary Focus**: Learning and course consumption
- **Key Screens**: Course Catalog, My Courses, Live Classes, Quizzes
- **Main Actions**: Browse, purchase, learn, take quizzes, join live classes

### Lecturer
- **Primary Focus**: Teaching and live class delivery
- **Key Screens**: Live Classes, Course Analytics, Student Management
- **Main Actions**: Schedule classes, conduct live sessions, upload materials

## Navigation Patterns

### Common Navigation (All Roles)
- Login/Logout
- Profile Settings
- Notifications
- Help/Support

### Role-Specific Navigation

**Admin:**
```
Dashboard → Users → Payments → Settings → Reports
```

**Staff:**
```
Dashboard → Courses → Quizzes → Content → Support
```

**Learner:**
```
Dashboard → Browse → My Courses → Live Classes → Quizzes → Profile
```

**Lecturer:**
```
Dashboard → My Courses → Live Classes → Materials → Students
```

## Mobile vs Web Considerations

### Mobile-First Screens (All Roles)
- Login/Register
- Dashboard
- Course Catalog (Learner)
- My Courses (Learner)
- Live Class Join (Learner)

### Web-Optimized Screens
- Admin Dashboard (complex tables)
- Course Creation (Staff)
- Quiz Builder (Staff)
- Live Class Management (Lecturer)
- Analytics/Reports (Admin, Lecturer)

---

**Related Documents:**
- [Use Cases](srs-06-use-cases.md)
- [User Interface Requirements](srs-04-interfaces.md)
- [System Architecture](srs-03-architecture.md)
