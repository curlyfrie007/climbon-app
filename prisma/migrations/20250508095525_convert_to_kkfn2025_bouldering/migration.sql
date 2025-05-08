/*
  Warnings:

  - The values [Männlich Ü40,Weiblich Ü40] on the enum `Startclass` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Startclass_new" AS ENUM ('Männlich', 'Weiblich');
ALTER TABLE "Participant" ALTER COLUMN "startclass" TYPE "Startclass_new" USING ("startclass"::text::"Startclass_new");
ALTER TYPE "Startclass" RENAME TO "Startclass_old";
ALTER TYPE "Startclass_new" RENAME TO "Startclass";
DROP TYPE "Startclass_old";
COMMIT;

-- AlterTable
ALTER TABLE "Participant" ALTER COLUMN "results" SET DEFAULT '{"boulders": [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false], "lastUpdateTime": null}';
