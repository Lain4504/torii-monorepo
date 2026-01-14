# Use Case Specifications: Authentication & User Management

**Project:** Torii Nihongo Learning Platform  
**Module:** Authentication & User Management  
**Use Cases:** UC-001 to UC-006  
**Version:** 1.0  
**Date:** January 2026

---

## Table of Contents

1. [UC-001: Login](#uc-001-login)
2. [UC-002: Register](#uc-002-register)
3. [UC-003: Forgot Password](#uc-003-forgot-password)
4. [UC-004: Reset Password](#uc-004-reset-password)
5. [UC-005: Logout](#uc-005-logout)
6. [UC-006: Manage Profile](#uc-006-manage-profile)

---

## UC-001: Login

### Primary Actor
- Learner, Lecturer, Staff, Admin

### Secondary Actor
- Email Service (for 2FA)
- Redis (for session management)

### Description
As a user, I want to log in to the system using my email and password so that I can access my account and use platform features.

### Trigger
**Direct trigger:** User clicks "Login" or "Sign In" button on the login page

**Timing trigger:** When token/session expires, system automatically redirects to Login page and displays message "Session has expired"

### Pre-condition
- User has registered account
- User's email is verified (verifiedAt is not null)
- User account is not banned (bannedUntil is null or in the past)
- User account is not deleted (deletedAt is null)

### Post-condition
- User is authenticated and logged in
- JWT access token and refresh token are generated
- User session is created in database
- User is redirected to appropriate dashboard based on role

### Validation Rules
- **VR-LOGIN-001:** Email must be valid email format
- **VR-LOGIN-002:** Password is required
- **VR-LOGIN-003:** Email and password cannot be empty

### Business Rules
- **BR-AUTH-010:** Email and password are required for login
- **BR-AUTH-011:** Email must be verified before login
- **BR-AUTH-012:** Account must not be banned
- **BR-AUTH-013:** Account must not be soft-deleted
- **BR-AUTH-014:** If 2FA is enabled, return temporary token instead of access token
- **BR-AUTH-015:** Admin portal login rejects users with role `learner`
- **BR-AUTH-016:** Password verification uses Argon2
- **BR-AUTH-017:** JWT access token expires based on JWT_EXPIRY env variable

### Normal Flow
1. User navigates to login page
2. System displays login form with email and password fields
3. User enters email and password
4. User clicks "Login" button
5. System validates input format
6. System checks if user exists by email
7. System verifies password using Argon2
8. System checks user status (verified, not banned, not deleted)
9. System checks if 2FA is enabled
   - If 2FA enabled: Go to Alternative Flow A
10. System generates JWT access token and refresh token
11. System creates user session in database
12. System stores refresh token in session
13. System returns tokens to client
14. Client stores tokens (access token in memory, refresh token in httpOnly cookie)
15. System redirects user to dashboard based on role:
    - Learner → Learner Dashboard
    - Lecturer → Lecturer Dashboard
    - Staff → Staff Dashboard
    - Admin → Admin Dashboard

### Alternative Flows

**Alternative Flow A: 2FA Required**
- 9a.1. System detects 2FA is enabled for user
- 9a.2. System generates temporary 2FA token (expires in 5 minutes)
- 9a.3. System stores temp token in Redis
- 9a.4. System returns response: `{ requiresTwoFactor: true, tempToken: "..." }`
- 9a.5. Client redirects to 2FA verification page
- 9a.6. User enters 6-digit TOTP code from authenticator app
- 9a.7. System validates TOTP code
- 9a.8. If valid: Continue to step 10
- 9a.9. If invalid: Display error "Invalid 2FA code", allow retry (max 3 attempts)

**Alternative Flow B: Invalid Credentials**
- 7b.1. Password verification fails
- 7b.2. System returns error "Invalid credentials" (401 Unauthorized)
- 7b.3. System logs failed login attempt
- 7b.4. Return to step 3

**Alternative Flow C: Email Not Verified**
- 8c.1. System detects verifiedAt is null
- 8c.2. System returns error "Email not verified. Please check your email." (401)
- 8c.3. System displays "Resend verification email" link
- 8c.4. End use case

**Alternative Flow D: Account Banned**
- 8d.1. System detects bannedUntil is in the future
- 8d.2. System returns error "Account is disabled or deleted" (401)
- 8d.3. System displays ban expiration date
- 8d.4. End use case

**Alternative Flow E: Account Deleted**
- 8e.1. System detects deletedAt is not null
- 8e.2. System returns error "Account is disabled or deleted" (401)
- 8e.3. End use case

**Alternative Flow F: Admin Portal - Learner Rejected**
- 8f.1. User attempts to login to admin portal with learner role
- 8f.2. System detects role is LEARNER
- 8f.3. System returns error "Access denied: Admin portals are restricted" (401)
- 8f.4. System logs security warning
- 8f.5. End use case

---

## UC-002: Register

### Primary Actor
- Guest User (not logged in)

### Secondary Actor
- Email Service (for verification email)
- Redis (for rate limiting)

### Description
As a guest user, I want to register a new account using my email and password so that I can access the learning platform.

### Trigger
**Navigation path:** Home Page → Sign Up / Register

**Direct trigger:** User clicks "Sign Up" or "Register" button

### Pre-condition
- User is not logged in
- User has valid email address
- Email is not already registered in system

### Post-condition
- New user account created with role LEARNER
- Verification email sent to user's email
- User is redirected to "Check your email" page

### Validation Rules
- **VR-REG-001:** Email must be valid email format
- **VR-REG-002:** Password must be at least 8 characters
- **VR-REG-003:** Password must contain at least one uppercase, one lowercase, one number
- **VR-REG-004:** Display name is optional, max 100 characters
- **VR-REG-005:** Terms and conditions must be accepted

### Business Rules
- **BR-AUTH-001:** Email must be unique across the system
- **BR-AUTH-002:** Password must be hashed using Argon2 before storage
- **BR-AUTH-003:** New users are assigned role `learner` by default
- **BR-AUTH-004:** Email verification is required before account activation
- **BR-AUTH-005:** Display name defaults to email username if not provided
- **BR-AUTH-006:** Users can register via email/password or OAuth (Google)
- **BR-AUTH-007:** OAuth users don't require password (nullable field)

### Normal Flow
1. User navigates to registration page
2. System displays registration form with fields:
   - Email (required)
   - Password (required)
   - Confirm Password (required)
   - Display Name (optional)
   - Terms and Conditions checkbox (required)
3. User fills in registration form
4. User clicks "Register" button
5. System validates input:
   - Email format
   - Password strength
   - Password confirmation match
   - Terms accepted
6. System checks if email already exists
7. System hashes password using Argon2
8. System generates display name (if not provided, use email username)
9. System creates user record:
   - email, password (hashed), displayName
   - role = LEARNER
   - verifiedAt = null
   - createdAt = now
10. System generates verification token (64-char hex string)
11. System stores verification token in Redis (TTL: 24 hours)
12. System sends verification email to user's email
13. System displays success message: "Registration successful. Please check your email for verification."
14. System redirects to "Check your email" page

### Alternative Flows

**Alternative Flow A: Email Already Exists**
- 6a.1. System detects email already exists in database
- 6a.2. System returns error "Email already exists" (409 Conflict)
- 6a.3. System suggests "Login" or "Forgot Password"
- 6a.4. Return to step 3

**Alternative Flow B: Weak Password**
- 5b.1. Password does not meet strength requirements
- 5b.2. System returns error "Password must be at least 8 characters" (400)
- 5b.3. System displays password requirements
- 5b.4. Return to step 3

**Alternative Flow C: Password Mismatch**
- 5c.1. Password and Confirm Password do not match
- 5c.2. System returns error "Passwords do not match" (400)
- 5c.3. Return to step 3

**Alternative Flow D: Terms Not Accepted**
- 5d.1. User did not check Terms and Conditions
- 5d.2. System returns error "You must accept Terms and Conditions" (400)
- 5d.3. Return to step 3

**Alternative Flow E: Email Sending Failed**
- 12e.1. Email service fails to send verification email
- 12e.2. System logs error
- 12e.3. User account is still created
- 12e.4. System displays message "Account created. If you don't receive email, click Resend"
- 12e.5. Continue to step 14

**Alternative Flow F: Register with Google OAuth**
- 3f.1. User clicks "Sign up with Google" button
- 3f.2. System redirects to Google OAuth consent screen
- 3f.3. User authorizes application
- 3f.4. Google returns authorization code
- 3f.5. System exchanges code for ID token
- 3f.6. System verifies ID token
- 3f.7. System extracts user info (email, name, picture)
- 3f.8. System checks if email already exists
- 3f.9. If email exists: Link Google account to existing user
- 3f.10. If email doesn't exist: Create new user with:
   - email, displayName (from Google)
   - password = null
   - verifiedAt = now (Google email is pre-verified)
   - role = LEARNER
- 3f.11. System creates UserIdentity record (provider: google, providerId: Google sub)
- 3f.12. System generates JWT tokens
- 3f.13. System redirects to dashboard
- 3f.14. End use case

---

## UC-003: Forgot Password

### Primary Actor
- Learner, Lecturer, Staff, Admin (any registered user)

### Secondary Actor
- Email Service (for password reset email)
- Redis (for rate limiting and token storage)

### Description
As a user, I want to request a password reset link via email so that I can recover access to my account if I forget my password.

### Trigger
**Navigation path:** Login Page → Forgot Password link

**Direct trigger:** User clicks "Forgot Password?" link on login page

### Pre-condition
- User has registered account
- User's email exists in system
- User account has password (not OAuth-only account)

### Post-condition
- Password reset email sent to user's email
- Reset token stored in Redis with 1-hour expiration
- Rate limit counter incremented

### Validation Rules
- **VR-FORGOT-001:** Email must be valid email format
- **VR-FORGOT-002:** Email is required

### Business Rules
- **BR-RESET-001:** Password reset is rate-limited to 3 requests per hour per email
- **BR-RESET-002:** Reset token is 64-character hex string, expires in 1 hour
- **BR-RESET-003:** Mobile platform uses 6-digit OTP, expires in 10 minutes
- **BR-RESET-004:** OAuth-only users (no password) cannot reset password

### Normal Flow
1. User navigates to login page
2. User clicks "Forgot Password?" link
3. System displays "Forgot Password" form with email field
4. User enters email address
5. User clicks "Send Reset Link" button
6. System validates email format
7. System checks rate limit for this email (max 3 requests/hour)
8. System checks if user exists by email
9. System checks if user has password (not OAuth-only)
10. System generates reset token (64-char hex string)
11. System stores reset token in Redis with key `reset-password:{email}` (TTL: 1 hour)
12. System increments rate limit counter in Redis
13. System constructs reset URL: `https://app.torii.com/reset-password?token={token}`
14. System sends password reset email with reset link
15. System displays success message: "Password reset email sent. Please check your email."
16. System redirects to "Check your email" page

### Alternative Flows

**Alternative Flow A: Rate Limit Exceeded**
- 7a.1. System detects more than 3 requests in past hour
- 7a.2. System gets TTL of rate limit key
- 7a.3. System calculates minutes remaining
- 7a.4. System returns error "Too many requests. Please try again in X minutes." (400)
- 7a.5. End use case

**Alternative Flow B: User Not Found**
- 8b.1. System does not find user with provided email
- 8b.2. System does NOT reveal this information (security best practice)
- 8b.3. System displays same success message as normal flow
- 8b.4. System does NOT send email
- 8b.5. End use case

**Alternative Flow C: OAuth-Only Account**
- 9c.1. System detects user.password is null (OAuth-only account)
- 9c.2. System returns error "This account uses OAuth login. Password reset is not available." (400)
- 9c.3. System suggests "Login with Google"
- 9c.4. End use case

**Alternative Flow D: Email Sending Failed**
- 14d.1. Email service fails to send email
- 14d.2. System logs error
- 14d.3. System still displays success message (don't reveal failure)
- 14d.4. Continue to step 16

**Alternative Flow E: Mobile Platform - OTP**
- 10e.1. Request comes from mobile platform (platform: 'mobile' in DTO)
- 10e.2. System generates 6-digit OTP instead of token
- 10e.3. System stores OTP in Redis (TTL: 10 minutes)
- 10e.4. System sends email with OTP code
- 10e.5. System displays "Enter the 6-digit code sent to your email"
- 10e.6. End use case

---

## UC-004: Reset Password

### Primary Actor
- Learner, Lecturer, Staff, Admin (user who requested password reset)

### Secondary Actor
- Redis (for token validation)
- Session Service (for revoking old sessions)

### Description
As a user, I want to set a new password using the reset token from my email so that I can regain access to my account.

### Trigger
**Navigation path:** Email → Click reset link → Reset Password page

**Direct trigger:** User clicks password reset link in email

### Pre-condition
- User has requested password reset (UC-003)
- Reset token is valid and not expired
- User has not already used this token

### Post-condition
- User's password is updated (hashed with Argon2)
- Reset token is deleted from Redis
- All existing user sessions are revoked
- User is redirected to login page with success message

### Validation Rules
- **VR-RESET-001:** Token must be valid 64-char hex string or 6-digit OTP
- **VR-RESET-002:** New password must be at least 8 characters
- **VR-RESET-003:** New password must meet strength requirements
- **VR-RESET-004:** Password confirmation must match new password

### Business Rules
- **BR-RESET-005:** After password reset, all existing sessions are revoked
- **BR-RESET-006:** Password reset token is one-time use
- **BR-RESET-007:** New password must be hashed with Argon2

### Normal Flow
1. User clicks reset link in email
2. System extracts token from URL query parameter
3. System validates token format
4. System checks if token exists in Redis
5. System retrieves user email from Redis token data
6. System displays "Reset Password" form with:
   - New Password field
   - Confirm Password field
7. User enters new password and confirmation
8. User clicks "Reset Password" button
9. System validates new password:
   - Length >= 8 characters
   - Strength requirements met
   - Confirmation matches
10. System retrieves user by email
11. System hashes new password using Argon2
12. System updates user.password in database
13. System deletes reset token from Redis
14. System revokes all user sessions (delete from sessions table)
15. System blacklists all existing access tokens in Redis
16. System displays success message: "Password reset successful. Please login with your new password."
17. System redirects to login page

### Alternative Flows

**Alternative Flow A: Invalid Token**
- 4a.1. Token does not exist in Redis (expired or invalid)
- 4a.2. System returns error "Invalid or expired reset token" (400)
- 4a.3. System displays "Request new reset link" button
- 4a.4. End use case

**Alternative Flow B: Weak Password**
- 9b.1. New password does not meet strength requirements
- 9b.2. System returns error "Password must be at least 8 characters" (400)
- 9b.3. System displays password requirements
- 9b.4. Return to step 7

**Alternative Flow C: Password Mismatch**
- 9c.1. New password and confirmation do not match
- 9c.2. System returns error "Passwords do not match" (400)
- 9c.3. Return to step 7

**Alternative Flow D: Token Already Used**
- 4d.1. Token was already used (deleted from Redis)
- 4d.2. System returns error "Reset link has already been used" (400)
- 4d.3. System displays "Request new reset link" button
- 4d.4. End use case

**Alternative Flow E: Mobile Platform - OTP**
- 2e.1. Request comes from mobile platform with OTP code
- 2e.2. System validates 6-digit OTP format
- 2e.3. System checks if OTP exists in Redis
- 2e.4. If valid: Continue to step 6
- 2e.5. If invalid: Return error "Invalid or expired verification code" (401)

---

## UC-005: Logout

### Primary Actor
- Learner, Lecturer, Staff, Admin (any logged-in user)

### Secondary Actor
- Redis (for token blacklisting)
- Session Service (for session revocation)

### Description
As a logged-in user, I want to logout from the system so that my session is terminated and my account is secure.

### Trigger
**Navigation path:** Dashboard → User Menu → Logout

**Direct trigger:** User clicks "Logout" button in user menu

### Pre-condition
- User is logged in (has valid access token)

### Post-condition
- Access token is blacklisted in Redis
- Refresh token session is revoked in database
- User is redirected to login page
- Client clears stored tokens

### Validation Rules
- None (logout works even with expired tokens)

### Business Rules
- **BR-LOGOUT-001:** Access token is blacklisted in Redis until expiry
- **BR-LOGOUT-002:** Refresh token session is revoked in database
- **BR-LOGOUT-003:** Expired tokens are blacklisted for 1 minute (safety measure)
- **BR-LOGOUT-004:** Invalid tokens are ignored (no error thrown)

### Normal Flow
1. User clicks "Logout" button in user menu
2. Client sends logout request with access token in Authorization header
3. System extracts access token from header
4. System decodes token to get payload (userId, jti, exp)
5. System calculates TTL (time until token expiry)
6. System blacklists access token in Redis:
   - Key: `blacklist:token:{jti}`
   - TTL: remaining time until expiry (or 1 minute if expired)
7. System extracts refresh token from httpOnly cookie
8. System finds session by refresh token hash
9. System deletes session from database
10. System returns success response: "Logout successful"
11. Client clears access token from memory
12. Client clears refresh token cookie
13. Client redirects to login page

### Alternative Flows

**Alternative Flow A: No Access Token**
- 3a.1. Request does not contain access token
- 3a.2. System skips blacklisting (steps 4-6)
- 3a.3. Continue to step 7

**Alternative Flow B: Invalid Access Token**
- 4b.1. Token is malformed or invalid
- 4b.2. System logs warning
- 4b.3. System skips blacklisting
- 4b.4. Continue to step 7

**Alternative Flow C: No Refresh Token**
- 7c.1. Request does not contain refresh token cookie
- 7c.2. System skips session revocation (steps 8-9)
- 7c.3. Continue to step 10

**Alternative Flow D: Session Not Found**
- 8d.1. Session does not exist in database (already deleted)
- 8d.2. System logs info
- 8d.3. Continue to step 10

**Alternative Flow E: Logout All Devices**
- 1e.1. User clicks "Logout from all devices"
- 1e.2. System finds all sessions for userId
- 1e.3. System deletes all sessions
- 1e.4. System blacklists all refresh tokens
- 1e.5. Continue to step 10

---

## UC-006: Manage Profile

### Primary Actor
- Learner, Lecturer, Staff, Admin

### Secondary Actor
- File Storage Service (for avatar upload)

### Description
As a logged-in user, I want to view and update my profile information so that I can keep my account details current and personalized.

### Trigger
**Navigation path:** Dashboard → User Menu → Profile

**Direct trigger:** User clicks "Profile" or "My Account" in user menu

### Pre-condition
- User is logged in

### Post-condition
- **View:** Profile information is displayed
- **Update:** Profile is updated in database, success message shown

### Validation Rules
- **VR-PROFILE-001:** Display name is required, max 100 characters
- **VR-PROFILE-002:** Display name cannot contain special characters
- **VR-PROFILE-003:** Avatar file must be image (JPEG, PNG, WebP)
- **VR-PROFILE-004:** Avatar file size max 5MB

### Business Rules
- **BR-USER-001:** User ID is UUID v4
- **BR-USER-002:** Email is unique and case-insensitive
- **BR-USER-003:** Display name is required (max 100 characters)
- **BR-USER-004:** Avatar URL is optional

### Normal Flow (View Profile)
1. User clicks "Profile" in user menu
2. System extracts userId from JWT token
3. System retrieves user data from database
4. System displays profile page with:
   - Avatar (if set, otherwise default avatar)
   - Display Name
   - Email
   - Role (Learner, Lecturer, Staff, Admin)
   - Account created date
   - Last login date
   - Email verification status
   - 2FA status (enabled/disabled)
   - OAuth connections (Google, etc.)
5. System displays "Edit Profile" button
6. System displays "Change Password" button (if user has password)
7. System displays "Enable 2FA" button (if not enabled)

### Normal Flow (Update Profile)
1. User clicks "Edit Profile" button
2. System displays edit form with current values:
   - Display Name (text input)
   - Avatar (file upload with preview)
3. User modifies display name and/or uploads new avatar
4. User clicks "Save Changes"
5. System validates input:
   - Display name length and format
   - Avatar file type and size (if uploaded)
6. If avatar uploaded:
   - System uploads file to S3/MinIO
   - System generates public URL
7. System updates user record in database:
   - displayName
   - avatarUrl (if changed)
   - updatedAt = now
8. System returns success response
9. System displays success message: "Profile updated successfully"
10. System refreshes profile page with new data

### Alternative Flows

**Alternative Flow A: User Not Found (View)**
- 3a.1. User ID from token does not exist in database
- 3a.2. System returns error "User not found" (404)
- 3a.3. System logs out user (invalid session)
- 3a.4. System redirects to login page
- 3a.5. End use case

**Alternative Flow B: OAuth-Only Account (View)**
- 6b.1. User has no password (OAuth-only account)
- 6b.2. System hides "Change Password" button
- 6b.3. System displays "This account uses Google login"

**Alternative Flow C: Invalid Display Name (Update)**
- 5c.1. Display name is empty or too long
- 5c.2. System returns error "Display name is required and must be max 100 characters" (400)
- 5c.3. Return to step 3

**Alternative Flow D: Invalid Avatar File (Update)**
- 5d.1. Avatar file is not an image or exceeds 5MB
- 5d.2. System returns error "Avatar must be an image (JPEG, PNG, WebP) and max 5MB" (400)
- 5d.3. Return to step 3

**Alternative Flow E: File Upload Failed (Update)**
- 6e.1. S3/MinIO upload fails
- 6e.2. System logs error
- 6e.3. System returns error "File upload failed. Please try again." (500)
- 6e.4. Return to step 3

---

**Last Updated:** 2026-01-12  
**Version:** 1.0  
**Status:** ✅ Complete
