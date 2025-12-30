# Test Accounts for Torii Nihongo Admin

## Quick Reference

| Email | Password | Role | Access |
|-------|----------|------|--------|
| admin@torii.com | password123 | Admin | ✅ Full access |
| staff@torii.com | password123 | Staff | ✅ Limited admin access |
| lecturer@torii.com | password123 | Lecturer | ✅ Teaching features |
| learner@torii.com | password123 | Learner | ❌ **BLOCKED** from web-admin |
| staff.sales@torii.com | password123 | Staff | ✅ Sales/support features |

---

## How to Seed

### Option 1: Using psql
```bash
psql -U your_user -d wajlc -f scripts/seed-test-users.sql
```

### Option 2: Using DBeaver / pgAdmin
1. Open SQL editor
2. Copy paste from `scripts/seed-test-users.sql`
3. Execute

### Option 3: Using Docker
```bash
docker exec -i postgres_container psql -U postgres -d wajlc < scripts/seed-test-users.sql
```

---

## Testing Scenarios

### ✅ Test Admin Login
```
Email: admin@torii.com
Password: password123
Expected: Full access to all features
```

### ✅ Test Staff Login
```
Email: staff@torii.com
Password: password123
Expected: Limited access (courses, blogs, reports)
```

### ✅ Test Lecturer Login
```
Email: lecturer@torii.com
Password: password123
Expected: Class management, grading features
```

### ❌ Test Learner Block
```
Email: learner@torii.com
Password: password123
Expected: "Learners cannot access admin panel" error + redirect
```

---

## RBAC Permissions

After login, check Redux state for permissions:
- **Admin:** `["*"]` (wildcard)
- **Staff:** `["user.view", "course.view_restricted", "blog.write", "report.view"]`
- **Lecturer:** `["live_class.manage", "attendance.mark", "submission.grade", ...]`
- **Learner:** `[]` (empty - blocked)

---

## Notes

- All passwords are hashed with bcrypt (10 rounds)
- Users are marked as email_verified = true
- Status is set to 'active'
- Safe to run multiple times (uses ON CONFLICT DO UPDATE)