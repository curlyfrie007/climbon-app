-- CreateEnum
CREATE TYPE "Startclass" AS ENUM ('Männlich', 'Weiblich', 'Männlich Ü40', 'Weiblich Ü40');

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL,
    "secret" TEXT NOT NULL,
    "startclass" "Startclass" NOT NULL,
    "results" JSONB NOT NULL DEFAULT '{"Route1":{"zone":0,"attempts":0},"Route2":{"zone":0,"attempts":0},"Route3":{"zone":0,"attempts":0},"Route4":{"zone":0,"attempts":0},"Route5":{"zone":0,"attempts":0},"Route6":{"zone":0,"attempts":0},"Route7":{"zone":0,"attempts":0},"Route8":{"zone":0,"attempts":0}}',

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);
