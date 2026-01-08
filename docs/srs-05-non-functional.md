# Software Requirements Specification (SRS)
## Section 6: Non-Functional Requirements

---

## 6.1 Performance Requirements

### 6.1.1 Response Time

| Operation | Target Response Time | Maximum Acceptable |
|-----------|---------------------|-------------------|
| API Endpoints | < 200ms | < 500ms |
| Page Load (Initial) | < 2 seconds | < 4 seconds |
| Page Load (Cached) | < 500ms | < 1 second |
| Database Queries | < 100ms | < 300ms |
| File Upload (10MB) | < 5 seconds | < 10 seconds |
| Video Streaming Start | < 3 seconds | < 5 seconds |
| Live Class Join | < 2 seconds | < 5 seconds |
| Search Results | < 500ms | < 1 second |

### 6.1.2 Throughput

- **API Requests:** 1000+ requests per second per service
- **Concurrent Users:** 10,000+ simultaneous users
- **Live Classes:** 50+ participants per room
- **Database Transactions:** 500+ transactions per second
- **File Uploads:** 100+ concurrent uploads

### 6.1.3 Resource Utilization

- **CPU Usage:** < 70% under normal load
- **Memory Usage:** < 80% of allocated memory
- **Database Connections:** < 80% of connection pool
- **Network Bandwidth:** Optimize for 1Gbps link

### 6.1.4 Scalability

- **Horizontal Scaling:** Services must scale horizontally
- **Database Scaling:** Support read replicas
- **Load Distribution:** Even distribution across instances
- **Auto-scaling:** Scale based on CPU/memory metrics

---

## 6.2 Security Requirements

### 6.2.1 Authentication

- **Password Policy:**
  - Minimum 8 characters
  - At least one uppercase, one lowercase, one number
  - Password hashing: Argon2 or bcrypt
  - Password expiration: 90 days (optional)

- **Session Management:**
  - JWT tokens với expiration
  - Refresh token rotation
  - Session timeout: 24 hours (inactive)
  - Secure cookie flags: HttpOnly, Secure, SameSite

- **Two-Factor Authentication (2FA):**
  - TOTP-based (Google Authenticator)
  - Backup codes
  - Optional for learners, recommended for staff/admin

- **OAuth Integration:**
  - Google OAuth 2.0
  - Secure token exchange
  - Account linking

### 6.2.2 Authorization

- **Role-Based Access Control (RBAC):**
  - Roles: learner, lecturer, staff, admin
  - Permissions granularity
  - Permission inheritance
  - Dynamic permission assignment

- **Resource Access Control:**
  - Users can only access their own data
  - Lecturers can only access assigned courses
  - Staff can access all courses (read)
  - Admin has full access

### 6.2.3 Data Protection

- **Encryption:**
  - Data in transit: TLS 1.2+
  - Data at rest: AES-256 encryption
  - Database encryption: PostgreSQL encryption
  - File encryption: S3 server-side encryption

- **Sensitive Data:**
  - Passwords: Never stored in plain text
  - Payment data: PCI-DSS compliance
  - Personal data: GDPR-like protection
  - API keys: Encrypted storage

- **Data Privacy:**
  - User consent for data collection
  - Right to access personal data
  - Right to delete personal data
  - Data anonymization for analytics

### 6.2.4 Payment Security

- **PCI-DSS Compliance:**
  - No storage of full credit card numbers
  - Tokenization for payment methods
  - Secure payment gateway integration
  - Regular security audits

- **Payment Processing:**
  - HTTPS only
  - Webhook signature verification
  - Idempotency keys
  - Fraud detection

### 6.2.5 Application Security

- **Input Validation:**
  - All user inputs validated
  - SQL injection prevention (Prisma ORM)
  - XSS prevention (Content Security Policy)
  - CSRF protection

- **API Security:**
  - Rate limiting: 100 requests/minute per IP
  - API key authentication
  - Request signing (for sensitive operations)
  - CORS configuration

- **Security Headers:**
  - Content-Security-Policy
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Strict-Transport-Security

### 6.2.6 Audit and Logging

- **Audit Logs:**
  - All sensitive operations logged
  - User actions tracked
  - Login attempts logged
  - Payment transactions logged

- **Security Monitoring:**
  - Failed login attempts
  - Unusual access patterns
  - Security event alerts
  - Regular security reviews

---

## 6.3 Reliability Requirements

### 6.3.1 Availability

- **System Uptime:** 99.9% (8.76 hours downtime/year)
- **Scheduled Maintenance:** < 4 hours/month, announced in advance
- **Planned Downtime:** Off-peak hours only

### 6.3.2 Fault Tolerance

- **Service Redundancy:**
  - Multiple service instances
  - Load balancing
  - Health checks và auto-recovery

- **Database Redundancy:**
  - Primary và replica databases
  - Automatic failover
  - Data replication

- **Infrastructure Redundancy:**
  - Multiple data centers (production)
  - CDN for static assets
  - Backup infrastructure

### 6.3.3 Error Handling

- **Error Recovery:**
  - Graceful degradation
  - Automatic retry với exponential backoff
  - Circuit breaker pattern
  - Fallback mechanisms

- **Error Reporting:**
  - User-friendly error messages
  - Detailed error logs
  - Error tracking (Sentry or similar)
  - Error notifications

### 6.3.4 Data Backup and Recovery

- **Backup Strategy:**
  - Daily database backups
  - Incremental backups every 6 hours
  - File storage backups
  - Backup retention: 30 days

- **Recovery:**
  - Recovery Time Objective (RTO): < 4 hours
  - Recovery Point Objective (RPO): < 1 hour
  - Disaster recovery plan
  - Regular recovery testing

---

## 6.4 Scalability Requirements

### 6.4.1 Horizontal Scaling

- **Service Scaling:**
  - Services must be stateless
  - Support multiple instances
  - Load balancing capability
  - Auto-scaling based on metrics

### 6.4.2 Database Scaling

- **Read Scaling:**
  - Read replicas for read-heavy operations
  - Connection pooling
  - Query optimization

- **Write Scaling:**
  - Database sharding (future)
  - Write optimization
  - Batch operations

### 6.4.3 Storage Scaling

- **File Storage:**
  - S3-compatible storage
  - CDN for content delivery
  - Automatic archiving
  - Storage lifecycle management

### 6.4.4 Capacity Planning

- **User Growth:**
  - Support 10,000+ active users
  - Support 1,000+ concurrent users
  - Support 100+ live classes simultaneously

- **Data Growth:**
  - Database: Support 1TB+ data
  - File storage: Support 10TB+ files
  - Archive old data automatically

---

## 6.5 Usability Requirements

### 6.5.1 User Interface

- **Design Principles:**
  - Intuitive navigation
  - Consistent UI/UX
  - Clear visual hierarchy
  - Responsive design

- **Accessibility:**
  - WCAG 2.1 Level AA compliance
  - Keyboard navigation
  - Screen reader support
  - High contrast mode
  - Font size adjustment

### 6.5.2 User Experience

- **Learning Curve:**
  - New users can complete basic tasks within 5 minutes
  - Tooltips và help text
  - Onboarding tutorial
  - Contextual help

- **Error Messages:**
  - Clear, actionable error messages
  - Suggestions for resolution
  - No technical jargon

### 6.5.3 Multi-language Support

- **Supported Languages:**
  - Vietnamese (primary)
  - English
  - Japanese (for course content)

- **Localization:**
  - Date/time formats
  - Currency formats (VND)
  - Number formats
  - Text direction (LTR)

### 6.5.4 Mobile Usability

- **Mobile Optimization:**
  - Touch-friendly interface
  - Responsive layouts
  - Mobile-optimized forms
  - Swipe gestures

---

## 6.6 Maintainability Requirements

### 6.6.1 Code Quality

- **Standards:**
  - TypeScript strict mode
  - ESLint configuration
  - Prettier code formatting
  - Code review required

- **Documentation:**
  - Inline code comments
  - API documentation (OpenAPI/Swagger)
  - Architecture documentation
  - README files

### 6.6.2 Testing

- **Test Coverage:**
  - Unit tests: > 80% coverage
  - Integration tests: Critical paths
  - E2E tests: User workflows
  - Performance tests: Load testing

- **Test Types:**
  - Unit tests (Jest)
  - Integration tests
  - E2E tests (Playwright/Cypress)
  - API tests (Postman/Newman)

### 6.6.3 Monitoring and Logging

- **Application Monitoring:**
  - Application performance monitoring (APM)
  - Error tracking
  - Real-time dashboards
  - Alerting

- **Logging:**
  - Structured logging (JSON)
  - Log levels: DEBUG, INFO, WARN, ERROR
  - Log aggregation (ELK stack or similar)
  - Log retention: 30 days

### 6.6.4 Deployment

- **CI/CD:**
  - Automated testing
  - Automated deployment
  - Rollback capability
  - Blue-green deployment

- **Version Control:**
  - Git version control
  - Branching strategy (Git Flow)
  - Code review process
  - Release tagging

---

## 6.7 Portability Requirements

### 6.7.1 Platform Independence

- **Backend:**
  - Node.js runtime (cross-platform)
  - Docker containerization
  - Cloud-agnostic design

### 6.7.2 Browser Compatibility

- **Supported Browsers:**
  - Chrome 100+
  - Firefox 100+
  - Safari 15+
  - Edge 100+

### 6.7.3 Operating System

- **Server:**
  - Linux (Ubuntu 22.04+)
  - Docker support

- **Client:**
  - Windows 10+
  - macOS 12+
  - Linux (modern distributions)
  - iOS 15+
  - Android 10+

---

**Next Section:** [Section 7: System Models](srs-07-system-models.md)


