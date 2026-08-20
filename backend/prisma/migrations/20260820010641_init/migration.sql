-- CreateEnum
CREATE TYPE "RentToOwnStatus" AS ENUM ('PROPOSED', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "PropertyListingType" AS ENUM ('SALE', 'RENT');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('AVAILABLE', 'UNDER_REVIEW', 'MATCHED', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "RegistryStatus" AS ENUM ('CLEAN', 'FLAGGED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "CommunityReportType" AS ENUM ('CONFIRMATION', 'DISPUTE', 'FRAUD_FLAG');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('BUYER_RENTER', 'LANDLORD', 'DEVELOPER', 'AGENT');

-- CreateTable
CREATE TABLE "Cooperative" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetAreaKey" TEXT NOT NULL,
    "targetPropertyType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cooperative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CooperativeMembership" (
    "id" TEXT NOT NULL,
    "cooperativeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "monthlyContributionAmount" DECIMAL(12,2) NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CooperativeMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contribution" (
    "id" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentToOwnMatch" (
    "id" TEXT NOT NULL,
    "cooperativeId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "status" "RentToOwnStatus" NOT NULL DEFAULT 'PROPOSED',
    "matchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RentToOwnMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandlordRating" (
    "id" TEXT NOT NULL,
    "landlordId" TEXT NOT NULL,
    "raterId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LandlordRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NeighbourhoodData" (
    "id" TEXT NOT NULL,
    "areaKey" TEXT NOT NULL,
    "floodRiskScore" INTEGER NOT NULL,
    "powerScore" INTEGER NOT NULL,
    "securityScore" INTEGER NOT NULL,
    "placesCache" JSONB,
    "commuteCache" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NeighbourhoodData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "listingType" "PropertyListingType" NOT NULL,
    "price" DECIMAL(14,2) NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "areaKey" TEXT NOT NULL,
    "status" "PropertyStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyDocument" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "plotNumber" TEXT NOT NULL,
    "surveyNumber" TEXT NOT NULL,
    "attestedOwnerName" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistryRecord" (
    "id" TEXT NOT NULL,
    "plotNumber" TEXT NOT NULL,
    "surveyNumber" TEXT NOT NULL,
    "status" "RegistryStatus" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistryRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityReport" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "type" "CommunityReportType" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustScore" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "registryStatus" TEXT NOT NULL,
    "communityAdjustment" INTEGER NOT NULL,
    "explanationText" TEXT NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrustScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'BUYER_RENTER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Cooperative_targetAreaKey_idx" ON "Cooperative"("targetAreaKey");

-- CreateIndex
CREATE UNIQUE INDEX "CooperativeMembership_cooperativeId_userId_key" ON "CooperativeMembership"("cooperativeId", "userId");

-- CreateIndex
CREATE INDEX "Contribution_membershipId_idx" ON "Contribution"("membershipId");

-- CreateIndex
CREATE INDEX "LandlordRating_landlordId_idx" ON "LandlordRating"("landlordId");

-- CreateIndex
CREATE UNIQUE INDEX "NeighbourhoodData_areaKey_key" ON "NeighbourhoodData"("areaKey");

-- CreateIndex
CREATE INDEX "Property_areaKey_idx" ON "Property"("areaKey");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyDocument_propertyId_key" ON "PropertyDocument"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyDocument_plotNumber_idx" ON "PropertyDocument"("plotNumber");

-- CreateIndex
CREATE INDEX "PropertyDocument_surveyNumber_idx" ON "PropertyDocument"("surveyNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RegistryRecord_plotNumber_surveyNumber_key" ON "RegistryRecord"("plotNumber", "surveyNumber");

-- CreateIndex
CREATE INDEX "CommunityReport_propertyId_idx" ON "CommunityReport"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "TrustScore_propertyId_key" ON "TrustScore"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "CooperativeMembership" ADD CONSTRAINT "CooperativeMembership_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "Cooperative"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeMembership" ADD CONSTRAINT "CooperativeMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "CooperativeMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentToOwnMatch" ADD CONSTRAINT "RentToOwnMatch_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "Cooperative"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentToOwnMatch" ADD CONSTRAINT "RentToOwnMatch_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandlordRating" ADD CONSTRAINT "LandlordRating_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandlordRating" ADD CONSTRAINT "LandlordRating_raterId_fkey" FOREIGN KEY ("raterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyDocument" ADD CONSTRAINT "PropertyDocument_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyDocument" ADD CONSTRAINT "PropertyDocument_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityReport" ADD CONSTRAINT "CommunityReport_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityReport" ADD CONSTRAINT "CommunityReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustScore" ADD CONSTRAINT "TrustScore_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
