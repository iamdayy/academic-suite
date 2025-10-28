-- DropForeignKey
ALTER TABLE "public"."students" DROP CONSTRAINT "students_user_id_fkey";

-- AlterTable
ALTER TABLE "students" ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
