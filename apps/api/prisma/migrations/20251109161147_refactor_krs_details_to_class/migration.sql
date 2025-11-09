-- DropForeignKey
ALTER TABLE "public"."krs_details" DROP CONSTRAINT "krs_details_class_id_fkey";

-- AddForeignKey
ALTER TABLE "krs_details" ADD CONSTRAINT "krs_details_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
