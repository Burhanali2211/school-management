/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Grade` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Grade` table without a default value. This is not possible if the table is not empty.

*/

-- First, add the name column as nullable
ALTER TABLE "Grade" ADD COLUMN "name" TEXT;

-- Update existing grades with Indian school names
UPDATE "Grade" SET "name" = 'Nursery' WHERE "level" = 1;
UPDATE "Grade" SET "name" = 'LKG' WHERE "level" = 2;
UPDATE "Grade" SET "name" = 'UKG' WHERE "level" = 3;
UPDATE "Grade" SET "name" = 'Class 1' WHERE "level" = 4;
UPDATE "Grade" SET "name" = 'Class 2' WHERE "level" = 5;
UPDATE "Grade" SET "name" = 'Class 3' WHERE "level" = 6;

-- Now make the name column required
ALTER TABLE "Grade" ALTER COLUMN "name" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Grade_name_key" ON "Grade"("name");
