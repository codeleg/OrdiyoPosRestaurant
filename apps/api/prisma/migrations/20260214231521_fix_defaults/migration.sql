/*
  Warnings:

  - Made the column `shift` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- Backfill existing NULLs
UPDATE "users" SET "shift" = 'FULL_DAY' WHERE "shift" IS NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "shift" SET NOT NULL,
ALTER COLUMN "shift" SET DEFAULT 'FULL_DAY',
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
