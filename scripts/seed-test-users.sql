-- ============================================
-- Test User Accounts for RBAC Testing (Firebase Auth)
-- ============================================
-- NOTE: Passwords are managed by Firebase.
-- This script seeds users into the local PostgreSQL database matching Prisma Schema.

-- 1. ADMIN USER
INSERT INTO users (
    id,
    email,
    full_name,
    role,
    status,
    firebase_uid,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'admin@torii.com',
    'Admin User',
    'admin',
    'active',
    'nPR4w0Ns1NOeACZMB8RbSaQ2V9L2',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    firebase_uid = EXCLUDED.firebase_uid,
    updated_at = NOW();

-- 2. STAFF USER (Academic Staff)
INSERT INTO users (
    id,
    email,
    full_name,
    role,
    status,
    firebase_uid,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'staff@torii.com',
    'Academic Staff',
    'staff',
    'active',
    'jvw95Pn4BPQZclKSq3C2RqEVzA83',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    firebase_uid = EXCLUDED.firebase_uid,
    updated_at = NOW();

-- 3. LECTURER USER
INSERT INTO users (
    id,
    email,
    full_name,
    role,
    status,
    firebase_uid,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'lecturer@torii.com',
    'Tanaka Sensei',
    'lecturer',
    'active',
    '5grDA3cgPeSdYhVj9Zw0PpQYbQV2',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    firebase_uid = EXCLUDED.firebase_uid,
    updated_at = NOW();

-- 4. LEARNER USER (Blocked from web-admin)
INSERT INTO users (
    id,
    email,
    full_name,
    role,
    status,
    firebase_uid,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'learner@torii.com',
    'Student Yamada',
    'learner',
    'active',
    'E3CDPLKzIDMn28vvYcikmw3H1CU2',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    firebase_uid = EXCLUDED.firebase_uid,
    updated_at = NOW();

-- 5. SALES STAFF USER
INSERT INTO users (
    id,
    email,
    full_name,
    role,
    status,
    firebase_uid,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'staff.sales@torii.com',
    'Sales Staff',
    'staff',
    'active',
    'hdlbbMXDTdQkTktb9wOBSg6V7Ez2',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    firebase_uid = EXCLUDED.firebase_uid,
    updated_at = NOW();

-- Verify seeded users
SELECT 
    email,
    full_name,
    role,
    firebase_uid,
    status
FROM users
WHERE email LIKE '%@torii.com'
ORDER BY role, email;
