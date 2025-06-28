/*
  Warnings:

  - You are about to drop the column `courseCode` on the `Batch` table. All the data in the column will be lost.
  - You are about to drop the column `courseCode` on the `TimetableEntry` table. All the data in the column will be lost.
  - You are about to drop the `Course` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `departmentCode` to the `Batch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departmentCode` to the `TimetableEntry` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Batch" DROP CONSTRAINT "Batch_courseCode_fkey";

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_degreeId_fkey";

-- DropForeignKey
ALTER TABLE "TimetableEntry" DROP CONSTRAINT "TimetableEntry_courseCode_fkey";

-- AlterTable
ALTER TABLE "Batch" DROP COLUMN "courseCode",
ADD COLUMN     "departmentCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TimetableEntry" DROP COLUMN "courseCode",
ADD COLUMN     "departmentCode" TEXT NOT NULL;

-- DropTable
DROP TABLE "Course";

-- CreateTable
CREATE TABLE "Department" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "degreeId" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_departmentCode_fkey" FOREIGN KEY ("departmentCode") REFERENCES "Department"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_degreeId_fkey" FOREIGN KEY ("degreeId") REFERENCES "Degree"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_departmentCode_fkey" FOREIGN KEY ("departmentCode") REFERENCES "Department"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
