/*
  Warnings:

  - You are about to drop the column `departmentCode` on the `TimetableEntry` table. All the data in the column will be lost.
  - Added the required column `course` to the `TimetableEntry` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TimetableEntry" DROP CONSTRAINT "TimetableEntry_departmentCode_fkey";

-- AlterTable
ALTER TABLE "TimetableEntry" DROP COLUMN "departmentCode",
ADD COLUMN     "course" TEXT NOT NULL;
