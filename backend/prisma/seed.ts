// Demo data for the hackathon build. RegistryRecord and NeighbourhoodData are
// explicitly seeded stand-ins for a real land-registry and
// flood/power/security data source — see docs/ARCHITECTURE.md §2.1 and §5.
import 'dotenv/config';
import * as argon2 from 'argon2';
import { PrismaClient, UserRole, RegistryStatus } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

// ── Curated room image sets ─────────────────────────────────────────────────
// Each set: [exterior, kitchen, bathroom, bedroom, living-room, surroundings]
// All are public Unsplash photos — no auth needed.
const ROOM_SETS = {
  modern_apartment: [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',   // exterior
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80',   // kitchen
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80',   // bathroom
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80', // bedroom
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',   // living room
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80', // surroundings
  ],
  duplex_family: [
    'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80',
  ],
  luxury_studio: [
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1556909075-51c9d2e5b430?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618219940310-0e5bdf0b2e41?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1200&q=80',
  ],
  penthouse: [
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=1200&q=80',
  ],
  gra_apartment: [
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80',
  ],
  mansion: [
    'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  ],
  tech_studio: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1200&q=80',
  ],
  surulere_flat: [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80',
  ],
  ajah_terrace: [
    'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80',
  ],
  gbagada_bungalow: [
    'https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80',
  ],
  magodo_flat: [
    'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1556909075-51c9d2e5b430?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80',
  ],
  lekki_semi: [
    'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=1200&q=80',
  ],
  vi_service: [
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618219940310-0e5bdf0b2e41?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=1200&q=80',
  ],
  ikeja_mini: [
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80',
  ],
};

async function main() {
  const password = await argon2.hash('password123');

  // ── Users ─────────────────────────────────────────────────────────────────
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

  const landlord2 = await prisma.user.upsert({
    where: { email: 'funke@example.com' },
    create: { name: 'Funke Adeyemi', email: 'funke@example.com', password, role: UserRole.LANDLORD },
    update: {},
  });

  const developer = await prisma.user.upsert({
    where: { email: 'developer@example.com' },
    create: { name: 'Lekki Homes Ltd', email: 'developer@example.com', password, role: UserRole.DEVELOPER },
    update: {},
  });

  const developer2 = await prisma.user.upsert({
    where: { email: 'tayo@example.com' },
    create: { name: 'Tayo Realty Group', email: 'tayo@example.com', password, role: UserRole.DEVELOPER },
    update: {},
  });

  // ── Registry Records ──────────────────────────────────────────────────────
  const registryRecords = [
    { plotNumber: 'PL-OJODU-001', surveyNumber: 'SV-2201', status: RegistryStatus.CLEAN, notes: 'Registered owner matches survey office records.' },
    { plotNumber: 'PL-MOWE-014', surveyNumber: 'SV-4410', status: RegistryStatus.DISPUTED, notes: 'Boundary dispute reported by two neighbouring families.' },
    { plotNumber: 'PL-LEKKI-019', surveyNumber: 'SV-7701', status: RegistryStatus.CLEAN, notes: 'Verified C of O, no encumbrances.' },
    { plotNumber: 'PL-IKOYI-033', surveyNumber: 'SV-9901', status: RegistryStatus.CLEAN, notes: 'Clean title, survey matches Lagos State records.' },
  ];
  for (const r of registryRecords) {
    await prisma.registryRecord.upsert({
      where: { plotNumber_surveyNumber: { plotNumber: r.plotNumber, surveyNumber: r.surveyNumber } },
      create: r, update: {},
    });
  }

  // ── Neighbourhood Data ────────────────────────────────────────────────────
  const neighbourhoods = [
    { areaKey: 'ojodu', floodRiskScore: 25, powerScore: 70, securityScore: 80 },
    { areaKey: 'mowe-ofada', floodRiskScore: 55, powerScore: 45, securityScore: 60 },
    { areaKey: 'lekki', floodRiskScore: 40, powerScore: 85, securityScore: 88 },
    { areaKey: 'victoria-island', floodRiskScore: 30, powerScore: 90, securityScore: 92 },
    { areaKey: 'ikeja', floodRiskScore: 20, powerScore: 75, securityScore: 78 },
    { areaKey: 'ikoyi', floodRiskScore: 15, powerScore: 95, securityScore: 95 },
    { areaKey: 'yaba', floodRiskScore: 35, powerScore: 65, securityScore: 70 },
    { areaKey: 'surulere', floodRiskScore: 45, powerScore: 60, securityScore: 72 },
    { areaKey: 'ajah', floodRiskScore: 50, powerScore: 70, securityScore: 75 },
    { areaKey: 'gbagada', floodRiskScore: 28, powerScore: 68, securityScore: 76 },
    { areaKey: 'magodo', floodRiskScore: 22, powerScore: 72, securityScore: 82 },
  ];
  for (const nd of neighbourhoods) {
    await prisma.neighbourhoodData.upsert({ where: { areaKey: nd.areaKey }, create: nd, update: {} });
  }

  // ── Properties ────────────────────────────────────────────────────────────
  const property = await prisma.property.upsert({
    where: { id: 'demo-property-ojodu' },
    create: {
      id: 'demo-property-ojodu',
      ownerId: landlord.id,
      title: '2-Bedroom Flat, Ojodu',
      description: 'Bright two-bedroom apartment with tiled floors, 24/7 generator backup, and a secure entry system close to schools and shops. The estate has a well-maintained compound with CCTV surveillance.',
      listingType: 'RENT', price: 1200000, bedrooms: 2,
      address: '12 Ogunlana Street, Ojodu, Lagos',
      lat: 6.6167, lng: 3.3833, areaKey: 'ojodu',
      imageUrl: ROOM_SETS.modern_apartment[0],
      galleryImages: ROOM_SETS.modern_apartment,
    },
    update: {},
  });

  await prisma.property.upsert({
    where: { id: 'demo-property-mowe' },
    create: {
      id: 'demo-property-mowe',
      ownerId: landlord.id,
      title: '3-Bedroom Duplex, Mowe Ofada',
      description: 'Family-sized duplex with parking, a quiet compound, and easy access to the expressway. Features a modern kitchen, ensuite master bedroom, and spacious backyard.',
      listingType: 'SALE', price: 22000000, bedrooms: 3,
      address: '7 Unity Road, Mowe Ofada, Ogun State',
      lat: 6.9067, lng: 3.4731, areaKey: 'mowe-ofada',
      imageUrl: ROOM_SETS.duplex_family[0],
      galleryImages: ROOM_SETS.duplex_family,
    },
    update: {},
  });

  await prisma.property.upsert({
    where: { id: 'demo-property-lekki' },
    create: {
      id: 'demo-property-lekki',
      ownerId: developer.id,
      title: 'Smart Studio, Lekki Phase 1',
      description: 'Compact, high-demand studio with balcony views, secure parking, and short commute to business districts. Fully furnished option available. Swimming pool and gym on site.',
      listingType: 'RENT', price: 1800000, bedrooms: 1,
      address: '35 Admiralty Way, Lekki Phase 1, Lagos',
      lat: 6.4392, lng: 3.4764, areaKey: 'lekki',
      imageUrl: ROOM_SETS.luxury_studio[0],
      galleryImages: ROOM_SETS.luxury_studio,
    },
    update: {},
  });

  await prisma.property.upsert({
    where: { id: 'demo-property-vi-penthouse' },
    create: {
      id: 'demo-property-vi-penthouse',
      ownerId: developer.id,
      title: '4-Bedroom Penthouse, Victoria Island',
      description: 'Luxurious penthouse on the 18th floor with panoramic ocean views. Marble floors, smart home automation, private rooftop terrace, and concierge service.',
      listingType: 'SALE', price: 280000000, bedrooms: 4,
      address: '18 Adeola Odeku Street, Victoria Island, Lagos',
      lat: 6.4269, lng: 3.4219, areaKey: 'victoria-island',
      imageUrl: ROOM_SETS.penthouse[0],
      galleryImages: ROOM_SETS.penthouse,
    },
    update: {},
  });

  await prisma.property.upsert({
    where: { id: 'demo-property-ikeja-3bed' },
    create: {
      id: 'demo-property-ikeja-3bed',
      ownerId: landlord2.id,
      title: '3-Bedroom Apartment, Ikeja GRA',
      description: 'Serene 3-bedroom apartment in the coveted Ikeja GRA. Modern open-plan living area, fitted kitchen, and a private garden. 24/7 security with estate access control.',
      listingType: 'RENT', price: 3500000, bedrooms: 3,
      address: '5 Mobolaji Johnson Avenue, Ikeja GRA, Lagos',
      lat: 6.5794, lng: 3.3387, areaKey: 'ikeja',
      imageUrl: ROOM_SETS.gra_apartment[0],
      galleryImages: ROOM_SETS.gra_apartment,
    },
    update: {},
  });

  await prisma.property.upsert({
    where: { id: 'demo-property-ikoyi-mansion' },
    create: {
      id: 'demo-property-ikoyi-mansion',
      ownerId: developer.id,
      title: '5-Bedroom Mansion, Ikoyi',
      description: 'Magnificent 5-bedroom mansion on a full plot in Old Ikoyi. Private pool, triple garage, cinema room, and lush tropical gardens. Staff quarters included.',
      listingType: 'SALE', price: 850000000, bedrooms: 5,
      address: '3 Bourdillon Road, Old Ikoyi, Lagos',
      lat: 6.4482, lng: 3.4397, areaKey: 'ikoyi',
      imageUrl: ROOM_SETS.mansion[0],
      galleryImages: ROOM_SETS.mansion,
    },
    update: {},
  });

  await prisma.property.upsert({
    where: { id: 'demo-property-yaba-studio' },
    create: {
      id: 'demo-property-yaba-studio',
      ownerId: landlord2.id,
      title: 'Modern Studio, Yaba Tech Hub',
      description: 'Contemporary studio apartment in the heart of Yaba\'s booming tech corridor. High-speed fibre internet included. Shared rooftop lounge and workspace.',
      listingType: 'RENT', price: 700000, bedrooms: 1,
      address: '22 Herbert Macaulay Way, Yaba, Lagos',
      lat: 6.5022, lng: 3.3726, areaKey: 'yaba',
      imageUrl: ROOM_SETS.tech_studio[0],
      galleryImages: ROOM_SETS.tech_studio,
    },
    update: {},
  });

  await prisma.property.upsert({
    where: { id: 'demo-property-surulere-2bed' },
    create: {
      id: 'demo-property-surulere-2bed',
      ownerId: landlord.id,
      title: '2-Bedroom Flat, Surulere',
      description: 'Well-maintained 2-bedroom apartment in a calm Surulere neighbourhood. Tiled throughout, with fitted wardrobes and a modern bathroom.',
      listingType: 'RENT', price: 950000, bedrooms: 2,
      address: '9 Adeleke Street, Surulere, Lagos',
      lat: 6.4969, lng: 3.3481, areaKey: 'surulere',
      imageUrl: ROOM_SETS.surulere_flat[0],
      galleryImages: ROOM_SETS.surulere_flat,
    },
    update: {},
  });

  await prisma.property.upsert({
    where: { id: 'demo-property-ajah-terrace' },
    create: {
      id: 'demo-property-ajah-terrace',
      ownerId: developer2.id,
      title: '3-Bedroom Terraced House, Ajah',
      description: 'Brand new terraced house in a modern gated estate in Ajah. Open-plan living, contemporary finishes, and a private parking space. Flexible payment plans available.',
      listingType: 'SALE', price: 55000000, bedrooms: 3,
      address: 'Block C, Greenfield Estate, Ajah, Lagos',
      lat: 6.4661, lng: 3.5628, areaKey: 'ajah',
      imageUrl: ROOM_SETS.ajah_terrace[0],
      galleryImages: ROOM_SETS.ajah_terrace,
    },
    update: {},
  });

  await prisma.property.upsert({
    where: { id: 'demo-property-gbagada-4bed' },
    create: {
      id: 'demo-property-gbagada-4bed',
      ownerId: landlord2.id,
      title: '4-Bedroom Detached, Gbagada Phase 2',
      description: 'Spacious detached bungalow with a large compound, ideal for a growing family. Four ensuite bedrooms, large living/dining area, and well-equipped kitchen.',
      listingType: 'SALE', price: 95000000, bedrooms: 4,
      address: '14 Okonkwo Close, Gbagada Phase 2, Lagos',
      lat: 6.5481, lng: 3.3847, areaKey: 'gbagada',
      imageUrl: ROOM_SETS.gbagada_bungalow[0],
      galleryImages: ROOM_SETS.gbagada_bungalow,
    },
    update: {},
  });

  await prisma.property.upsert({
    where: { id: 'demo-property-magodo-2bed' },
    create: {
      id: 'demo-property-magodo-2bed',
      ownerId: developer2.id,
      title: '2-Bedroom Apartment, Magodo GRA',
      description: 'Cosy and well-kept 2-bedroom apartment in serene Magodo GRA. The estate is calm, well-lit, and gated with round-the-clock security.',
      listingType: 'RENT', price: 1500000, bedrooms: 2,
      address: '6 Oke-Ira Street, Magodo GRA, Lagos',
      lat: 6.6086, lng: 3.3951, areaKey: 'magodo',
      imageUrl: ROOM_SETS.magodo_flat[0],
      galleryImages: ROOM_SETS.magodo_flat,
    },
    update: {},
  });

  await prisma.property.upsert({
    where: { id: 'demo-property-lekki2-5bed' },
    create: {
      id: 'demo-property-lekki2-5bed',
      ownerId: developer.id,
      title: '5-Bedroom Semi-Detached, Lekki Phase 2',
      description: 'Stunning semi-detached home with a home theatre, chef\'s kitchen, private pool, and landscaped garden. Smart home enabled with premium finishing throughout.',
      listingType: 'SALE', price: 185000000, bedrooms: 5,
      address: '22 Admiralty Estate, Lekki Phase 2, Lagos',
      lat: 6.4698, lng: 3.5442, areaKey: 'lekki',
      imageUrl: ROOM_SETS.lekki_semi[0],
      galleryImages: ROOM_SETS.lekki_semi,
    },
    update: {},
  });

  await prisma.property.upsert({
    where: { id: 'demo-property-vi-office' },
    create: {
      id: 'demo-property-vi-office',
      ownerId: developer2.id,
      title: '1-Bedroom Service Flat, VI',
      description: 'Executive serviced apartment for business travellers. Fully furnished with hotel-standard amenities, high-speed Wi-Fi, daily cleaning, and 24/7 concierge.',
      listingType: 'RENT', price: 4200000, bedrooms: 1,
      address: '11 Ozumba Mbadiwe Avenue, Victoria Island, Lagos',
      lat: 6.4337, lng: 3.4212, areaKey: 'victoria-island',
      imageUrl: ROOM_SETS.vi_service[0],
      galleryImages: ROOM_SETS.vi_service,
    },
    update: {},
  });

  await prisma.property.upsert({
    where: { id: 'demo-property-ikeja-mini' },
    create: {
      id: 'demo-property-ikeja-mini',
      ownerId: landlord2.id,
      title: 'Mini-Flat, Ikeja',
      description: 'Affordable and cosy mini-flat in a secure estate near Ikeja bus stop. Recently painted and tiled, with good water supply and generator backup.',
      listingType: 'RENT', price: 450000, bedrooms: 1,
      address: '3 Allen Avenue, Ikeja, Lagos',
      lat: 6.6013, lng: 3.3442, areaKey: 'ikeja',
      imageUrl: ROOM_SETS.ikeja_mini[0],
      galleryImages: ROOM_SETS.ikeja_mini,
    },
    update: {},
  });

  // ── Property Document ─────────────────────────────────────────────────────
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

  // ── Cooperatives ──────────────────────────────────────────────────────────
  const cooperative = await prisma.cooperative.upsert({
    where: { id: 'demo-coop-mowe-ofada' },
    create: { id: 'demo-coop-mowe-ofada', name: 'Mowe-Ofada 2-Bedroom Savers', targetAreaKey: 'mowe-ofada', targetPropertyType: '2-bedroom' },
    update: {},
  });

  const buyerMembership = await prisma.cooperativeMembership.upsert({
    where: { cooperativeId_userId: { cooperativeId: cooperative.id, userId: buyer.id } },
    create: { cooperativeId: cooperative.id, userId: buyer.id, monthlyContributionAmount: 18000 },
    update: {},
  });

  const ojoduCooperative = await prisma.cooperative.upsert({
    where: { id: 'demo-coop-ojodu' },
    create: { id: 'demo-coop-ojodu', name: 'Ojodu 2-Bedroom Savers', targetAreaKey: 'ojodu', targetPropertyType: '2-bedroom' },
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

  console.log('Seed complete:', {
    buyer: buyer.email,
    landlord: landlord.email,
    landlord2: landlord2.email,
    developer: developer.email,
    developer2: developer2.email,
    properties: 14,
  });
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
