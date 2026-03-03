-- CreateTable
CREATE TABLE "final_bar_exam_qa" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'admin',
    "updatedBy" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "final_bar_exam_qa_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "final_bar_exam_qa" ADD CONSTRAINT "final_bar_exam_qa_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
