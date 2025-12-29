-- ============================================
-- Test User Accounts for RBAC Testing
-- ============================================
-- All accounts use password: "password123"
-- Note: salt field is empty (bcrypt handles salt internally)

-- 1. ADMIN USER
INSERT INTO users (
    id,
    email,
    full_name,
    password,
    salt,
    role,
    status,
    email_verified,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'admin@torii.com',
    'Admin User',
    '$2b$10$duLG5tg2QJiz3sg.a8z5l.dhyuMXH4fINUBTWQdHdQc3XsxnGoVO2', -- password123
    '',  -- Empty (bcrypt handles salt internally)
    'admin',
    'active',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    updated_at = NOW();

-- 2. STAFF USER (Academic Staff Template)
INSERT INTO users (
    id,
    email,
    full_name,
    password,
    salt,
    role,
    status,
    email_verified,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'staff@torii.com',
    'Academic Staff',
    '$2b$10$duLG5tg2QJiz3sg.a8z5l.dhyuMXH4fINUBTWQdHdQc3XsxnGoVO2', -- password123
    '',  -- Empty (bcrypt handles salt internally)
    'staff',
    'active',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    updated_at = NOW();

-- 3. LECTURER USER
INSERT INTO users (
    id,
    email,
    full_name,
    password,
    salt,
    role,
    status,
    email_verified,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'lecturer@torii.com',
    'Tanaka Sensei',
    '$2b$10$duLG5tg2QJiz3sg.a8z5l.dhyuMXH4fINUBTWQdHdQc3XsxnGoVO2', -- password123
    '',  -- Empty (bcrypt handles salt internally)
    'lecturer',
    'active',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    updated_at = NOW();

-- 4. LEARNER USER (Should be blocked from web-admin)
INSERT INTO users (
    id,
    email,
    full_name,
    password,
    salt,
    role,
    status,
    email_verified,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'learner@torii.com',
    'Student Yamada',
    '$2b$10$duLG5tg2QJiz3sg.a8z5l.dhyuMXH4fINUBTWQdHdQc3XsxnGoVO2', -- password123
    '',  -- Empty (bcrypt handles salt internally)
    'learner',
    'active',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    updated_at = NOW();

-- 5. SALES STAFF USER
INSERT INTO users (
    id,
    email,
    full_name,
    password,
    salt,
    role,
    status,
    email_verified,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'staff.sales@torii.com',
    'Sales Staff',
    '$2b$10$duLG5tg2QJiz3sg.a8z5l.dhyuMXH4fINUBTWQdHdQc3XsxnGoVO2', -- password123
    '',  -- Empty (bcrypt handles salt internally)
    'staff',
    'active',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    updated_at = NOW();

-- Verify seeded users
SELECT 
    email,
    full_name,
    role,
    status,
    email_verified
FROM users
WHERE email LIKE '%@torii.com'
ORDER BY role, email;
