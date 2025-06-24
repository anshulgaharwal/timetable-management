-- CreateTable
CREATE TABLE "TimetableEntry" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "classroom" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "batchId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimetableEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_courseCode_fkey" FOREIGN KEY ("courseCode") REFERENCES "Course"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
