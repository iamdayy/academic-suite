/*
  Warnings:

  - You are about to drop the column `course_id` on the `krs_details` table. All the data in the column will be lost.
  - Added the required column `class_id` to the `krs_details` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."krs_details" DROP CONSTRAINT "krs_details_course_id_fkey";

-- AlterTable
ALTER TABLE "krs_details" DROP COLUMN "course_id",
ADD COLUMN     "class_id" BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE "krs_details" ADD CONSTRAINT "krs_details_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
