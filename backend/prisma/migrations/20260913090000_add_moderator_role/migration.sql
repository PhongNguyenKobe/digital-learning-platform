-- Restore the limited moderation role without changing existing accounts.
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'MODERATOR';
