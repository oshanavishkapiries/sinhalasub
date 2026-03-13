-- Seed/bootstrap data (idempotent)

-- Bootstrap admin user
-- Email: admin@sinhalasub.lk
-- Password: admin@1234 (stored as bcrypt hash only)
INSERT INTO users (username, email, password_hash, role, is_verified, is_active)
VALUES (
    'system-admin',
    'admin@sinhalasub.lk',
    '$2a$10$zKzzamKu3OEfrC34xlHQuew0oug7FrDsALXeAuxjM4g1WUito39ey',
    'admin',
    TRUE,
    TRUE
)
ON CONFLICT (email) DO UPDATE SET
    username = EXCLUDED.username,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    is_verified = EXCLUDED.is_verified,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

