-- CreateTable
CREATE TABLE "grading_policies" (
    "id" BIGSERIAL NOT NULL,
    "class_id" BIGINT NOT NULL,
    "attendance_weight" INTEGER NOT NULL DEFAULT 0,
    "assignment_weight" INTEGER NOT NULL DEFAULT 0,
    "uts_weight" INTEGER NOT NULL DEFAULT 0,
    "uas_weight" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grading_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_scores" (
    "id" BIGSERIAL NOT NULL,
    "student_id" BIGINT NOT NULL,
    "class_id" BIGINT NOT NULL,
    "score_uts" DOUBLE PRECISION,
    "score_uas" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "grading_policies_class_id_key" ON "grading_policies"("class_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_scores_student_id_class_id_key" ON "student_scores"("student_id", "class_id");

-- AddForeignKey
ALTER TABLE "grading_policies" ADD CONSTRAINT "grading_policies_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_scores" ADD CONSTRAINT "student_scores_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_scores" ADD CONSTRAINT "student_scores_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
