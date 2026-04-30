-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'OFF_DUTY');

-- CreateEnum
CREATE TYPE "ShiftType" AS ENUM ('MORNING', 'EVENING', 'FULL_DAY');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "shift" "ShiftType",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'OFF_DUTY';
