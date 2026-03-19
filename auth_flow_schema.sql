-- =============================================================================
-- NEW LMS PROJECT: AUTH & IDENTITY SCHEMA (RBAC Focus)
-- =============================================================================
-- Description: Professional PostgreSQL schema for full Auth flow with 
--              dynamic roles and permissions.
-- =============================================================================

-- 0. EXTENSIONS & UTILS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to handle updated_at automatically
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 1. AUTH CORE (USERS & SECURITY)
-- =============================================================================

-- Table: Users (Core profile)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255),        -- Nullable for OAuth-only users
    avatar_url TEXT,
    
    -- Status & Auth metadata
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    banned_until TIMESTAMPTZ,          -- NULL = not banned
    last_sign_in_at TIMESTAMPTZ,
    
    -- Flexible metadata (Supabase style)
    app_metadata JSONB DEFAULT '{}',   -- System-related (provider, etc.)
    user_metadata JSONB DEFAULT '{}',  -- Profile-related (bio, phone, etc.)
    
    -- Common Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ             -- Soft delete support
);

-- Table: OAuth User Identities
CREATE TABLE user_identities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,     -- 'email', 'google', 'github'
    provider_user_id VARCHAR(255) NOT NULL, -- ID from OAuth provider
    provider_data JSONB,               -- Raw payload from provider
    last_sign_in_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider, provider_user_id)
);

-- Table: Sessions (Refresh Tokens)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 hash
    device_info TEXT,                 -- User agent or device serial
    ip_address INET,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: 2FA Settings (TOTP)
CREATE TABLE two_factor_auth (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT FALSE,
    method VARCHAR(20) DEFAULT 'totp', -- Currently 'totp' (Google Auth)
    totp_secret TEXT,                  -- AES-256 encrypted string
    backup_codes TEXT[],               -- Hashed array of codes
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. DYNAMIC ACCESS CONTROL (DYNAMIC RBAC)
-- =============================================================================

-- Table: Permissions (Pre-defined action codes)
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL, -- 'user.create', 'course.delete'
    name VARCHAR(255) NOT NULL,        -- 'Create new users'
    module VARCHAR(50) NOT NULL,       -- 'USER', 'COURSE', 'FINANCE'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: Roles (Custom-definable by admins)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,  -- 'admin', 'tutor_head'
    name VARCHAR(100) NOT NULL,        -- 'Head of Tutors'
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,   -- System roles cannot be deleted
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: Role Permissions (Mapping permissions to custom roles)
CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

-- Table: User Roles (Mapping users to roles)
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- =============================================================================
-- 3. INFRASTRUCTURE & TRIGGERS
-- =============================================================================

-- =============================================================================
-- 3.1 AUDIT LOGS (SECURITY & COMPLIANCE)
-- =============================================================================

-- Table: Audit Logs (append-only)
-- Notes:
-- - Store actor identity if available (user_id), otherwise leave NULL and rely on actor_* fields.
-- - `request_id` is optional but useful for correlating logs across services.
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Who did it
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_type VARCHAR(30) NOT NULL DEFAULT 'user', -- 'user' | 'system' | 'service'
    actor_display TEXT,

    -- What happened
    action VARCHAR(120) NOT NULL,                  -- e.g. 'auth.sign_in', 'payment.verify'
    entity_type VARCHAR(80),                       -- e.g. 'user', 'order'
    entity_id UUID,

    -- Request/Client context
    request_id VARCHAR(128),
    ip_address INET,
    user_agent TEXT,

    -- Details
    metadata JSONB NOT NULL DEFAULT '{}',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add Triggers for updated_at
CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER update_user_identities_timestamp BEFORE UPDATE ON user_identities FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER update_two_factor_auth_timestamp BEFORE UPDATE ON two_factor_auth FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER update_permissions_timestamp BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER update_roles_timestamp BEFORE UPDATE ON roles FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Create Essential Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token_hash);
CREATE INDEX idx_permissions_module ON permissions(module);

-- Audit log indexes
CREATE INDEX idx_audit_logs_actor_user_id ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =============================================================================
-- 4. SEEDING EXAMPLE (Initial Setup)
-- =============================================================================

-- Example: Creating a Super Admin role and assign all permissions
-- Note: Permission 'all' is an example, usually you list each one.
-- INSERT INTO permissions (code, name, module) VALUES ('*', 'Superuser Access', 'SYSTEM');
-- INSERT INTO roles (code, name, is_system) VALUES ('super_admin', 'Super Administrator', true);
-- INSERT INTO role_permissions (role_id, permission_id) 
--    SELECT (SELECT id FROM roles WHERE code = 'super_admin'), id FROM permissions;
