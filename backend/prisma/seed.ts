// Demo data for the hackathon build. RegistryRecord and NeighbourhoodData are
// explicitly seeded stand-ins for a real land-registry and
// flood/power/security data source — see docs/ARCHITECTURE.md §2.1 and §5.
import 'dotenv/config';
import * as argon2 from 'argon2';
import { PrismaClient, UserRole, RegistryStatus } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  const password = await argon2.hash('password123');

  const buyer = await prisma.user.upsert({
    where: { email: 'ada@example.com' },
    create: { name: 'Ada Obi', email: 'ada@example.com', password, role: UserRole.BUYER_RENTER },
    update: {},
  });

  const landlord = await prisma.user.upsert({
    where: { email: 'chidi@example.com' },
    create: { name: 'Chidi Eze', email: 'chidi@example.com', password, role: UserRole.LANDLORD },
    update: {},
  });

  const developer = await prisma.user.upsert({
    where: { email: 'developer@example.com' },
    create: { name: 'Lekki Homes Ltd', email: 'developer@example.com', password, role: UserRole.DEVELOPER },
    update: {},
  });

  await prisma.registryRecord.upsert({
    where: { plotNumber_surveyNumber: { plotNumber: 'PL-OJODU-001', surveyNumber: 'SV-2201' } },
    create: {
      plotNumber: 'PL-OJODU-001',
      surveyNumber: 'SV-2201',
      status: RegistryStatus.CLEAN,
      notes: 'Demo record — registered owner matches survey office records.',
    },
    update: {},
  });

  await prisma.registryRecord.upsert({
    where: { plotNumber_surveyNumber: { plotNumber: 'PL-MOWE-014', surveyNumber: 'SV-4410' } },
    create: {
      plotNumber: 'PL-MOWE-014',
      surveyNumber: 'SV-4410',
      status: RegistryStatus.DISPUTED,
      notes: 'Demo record — boundary dispute reported by two neighbouring families.',
    },
    update: {},
  });

  await prisma.neighbourhoodData.upsert({
    where: { areaKey: 'ojodu' },
    create: {
      areaKey: 'ojodu',
      floodRiskScore: 25,
      powerScore: 70,
      securityScore: 80,
    },
    update: {},
  });

  await prisma.neighbourhoodData.upsert({
    where: { areaKey: 'mowe-ofada' },
    create: {
      areaKey: 'mowe-ofada',
      floodRiskScore: 55,
      powerScore: 45,
      securityScore: 60,
    },
    update: {},
  });

  const property = await prisma.property.upsert({
    where: { id: 'demo-property-ojodu' },
    create: {
      id: 'demo-property-ojodu',
      ownerId: landlord.id,
      title: '2-bedroom flat, Ojodu',
      listingType: 'RENT',
      price: 1200000,
      bedrooms: 2,
      address: '12 Ogunlana Street, Ojodu, Lagos',
      lat: 6.6167,
      lng: 3.3833,
      areaKey: 'ojodu',
    },
    update: {},
  });

  await prisma.propertyDocument.upsert({
    where: { propertyId: property.id },
    create: {
      propertyId: property.id,
      submittedById: landlord.id,
      plotNumber: 'PL-OJODU-001',
      surveyNumber: 'SV-2201',
      attestedOwnerName: 'Chidi Eze',
      documentType: 'Certificate of Occupancy',
    },
    update: {},
  });

  const cooperative = await prisma.cooperative.upsert({
    where: { id: 'demo-coop-mowe-ofada' },
    create: {
      id: 'demo-coop-mowe-ofada',
      name: 'Mowe-Ofada 2-Bedroom Savers',
      targetAreaKey: 'mowe-ofada',
      targetPropertyType: '2-bedroom',
    },
    update: {},
  });

  const buyerMembership = await prisma.cooperativeMembership.upsert({
    where: { cooperativeId_userId: { cooperativeId: cooperative.id, userId: buyer.id } },
    create: { cooperativeId: cooperative.id, userId: buyer.id, monthlyContributionAmount: 18000 },
    update: {},
  });

  const ojoduCooperative = await prisma.cooperative.upsert({
    where: { id: 'demo-coop-ojodu' },
    create: {
      id: 'demo-coop-ojodu',
      name: 'Ojodu 2-Bedroom Savers',
      targetAreaKey: 'ojodu',
      targetPropertyType: '2-bedroom',
    },
    update: {},
  });

  const landlordMembership = await prisma.cooperativeMembership.upsert({
    where: { cooperativeId_userId: { cooperativeId: ojoduCooperative.id, userId: landlord.id } },
    create: { cooperativeId: ojoduCooperative.id, userId: landlord.id, monthlyContributionAmount: 15000 },
    update: {},
  });

  // Seeded contribution history so the cooperative dashboard has something real
  // to show — see docs/ARCHITECTURE.md §5 ("seeded, not live payment integration").
  await seedContributions(buyerMembership.id, 18000, 6);
  await seedContributions(landlordMembership.id, 15000, 3);

  console.log('Seed complete:', { buyer: buyer.email, landlord: landlord.email, developer: developer.email });
}

async function seedContributions(membershipId: string, amount: number, months: number) {
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const existing = await prisma.contribution.findFirst({ where: { membershipId, month } });
    if (existing) continue;
    await prisma.contribution.create({ data: { membershipId, amount, month } });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
