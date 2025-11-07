-- DropForeignKey
ALTER TABLE "public"."lecturers" DROP CONSTRAINT "lecturers_user_id_fkey";

-- AlterTable
ALTER TABLE "lecturers" ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "lecturers" ADD CONSTRAINT "lecturers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
