-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STAFF', 'ADMIN');

-- CreateEnum
CREATE TYPE "PersonType" AS ENUM ('STAFF', 'INTERN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING', 'APPROVED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "ClockMethod" AS ENUM ('PHONE_QR', 'STATION', 'ADMIN_MANUAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "staffId" TEXT,
    "personType" "PersonType" NOT NULL DEFAULT 'STAFF',
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "department" TEXT,
    "role" "Role" NOT NULL DEFAULT 'STAFF',
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClockRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "method" "ClockMethod" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withinRange" BOOLEAN,
    "distanceMeters" INTEGER,
    "note" TEXT,
    "enteredById" TEXT,

    CONSTRAINT "ClockRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExcusedDay" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "userId" TEXT,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExcusedDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "branchLatitude" DOUBLE PRECISION NOT NULL DEFAULT 5.3018,
    "branchLongitude" DOUBLE PRECISION NOT NULL DEFAULT -1.9930,
    "radiusMeters" INTEGER NOT NULL DEFAULT 100,
    "absenceThreshold" INTEGER NOT NULL DEFAULT 5,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_staffId_key" ON "User"("staffId");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_personType_idx" ON "User"("personType");

-- CreateIndex
CREATE INDEX "ClockRecord_userId_timestamp_idx" ON "ClockRecord"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "ExcusedDay_date_idx" ON "ExcusedDay"("date");

-- CreateIndex
CREATE INDEX "ExcusedDay_userId_idx" ON "ExcusedDay"("userId");

-- AddForeignKey
ALTER TABLE "ClockRecord" ADD CONSTRAINT "ClockRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExcusedDay" ADD CONSTRAINT "ExcusedDay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
