-- The platform has two account types: regular users (STUDENT) and administrators (ADMIN).
-- Existing contributor and moderator accounts become regular users without removing their data.
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'ADMIN');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users"
  ALTER COLUMN "role" TYPE "UserRole"
  USING (CASE WHEN "role"::text = 'ADMIN' THEN 'ADMIN' ELSE 'STUDENT' END)::"UserRole";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'STUDENT';
DROP TYPE "UserRole_old";
