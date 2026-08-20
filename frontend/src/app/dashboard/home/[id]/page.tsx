"use client";

import {
  ArrowLeft,
  Bath,
  Bed,
  BookmarkCheck,
  Building,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  Heart,
  Home,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  UtensilsCrossed,
  Waves,
  Wind,
  X,
  Zap,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ApiError,
  fetchLandlordProfile,
  fetchProperty,
  getSavedPropertyIds,
  toggleSavedProperty,
  type LandlordProfile,
  type PropertyDetail,
} from "@/lib/api";

// ── Constants ─────────────────────────────────────────────────────────────────
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80",
];

const ROOM_LABELS = ["Exterior", "Kitchen", "Bathroom", "Bedroom", "Living Room", "Surroundings"];
const ROOM_ICONS = [Home, UtensilsCrossed, Waves, Bed, Sparkles, MapPin];

const FEATURES = [
  { icon: Zap, label: "Generator / NEPA", sub: "24/7 power backup" },
  { icon: Wind, label: "AC Ready", sub: "Pre-fitted points" },
  { icon: Waves, label: "Running Water", sub: "Borehole + tank" },
  { icon: ShieldCheck, label: "Secure Estate", sub: "CCTV & security" },
  { icon: Building, label: "Parking Space", sub: "Dedicated parking" },
  { icon: Phone, label: "Fibre Ready", sub: "High-speed internet" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatPrice(price: string | number, listingType: string) {
  const n = Number(price);
  const suffix = listingType === "RENT" ? "/yr" : "";
  if (n >= 1_000_000_000)
    return `₦${(n / 1_000_000_000).toFixed(1)}B${suffix}`;
  if (n >= 1_000_000)
    return `₦${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M${suffix}`;
  return `₦${n.toLocaleString()}${suffix}`;
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function formatArea(key: string) {
  return key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Full-Screen Gallery Modal ─────────────────────────────────────────────────
function GalleryModal({
  images,
  startIdx,
  onClose,
}: {
  images: string[];
  startIdx: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIdx);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const RoomIcon = ROOM_ICONS[idx] ?? Home;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition"
        >
          <X className="h-4 w-4" /> Close
        </button>
        <span className="text-sm font-medium text-white/60">
          {idx + 1} / {images.length}
        </span>
      </div>

      {/* Image */}
      <div className="relative flex flex-1 items-center justify-center px-16">
        <button
          type="button"
          onClick={prev}
          className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <img
          key={idx}
          src={images[idx]}
          alt={ROOM_LABELS[idx] ?? `Photo ${idx + 1}`}
          className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl"
        />

        <button
          type="button"
          onClick={next}
          className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25 transition"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Room label + thumbnail strip */}
      <div className="pb-6 pt-4">
        <p className="mb-3 flex items-center justify-center gap-2 text-sm font-medium text-white/70">
          <RoomIcon className="h-4 w-4" />
          {ROOM_LABELS[idx] ?? `Photo ${idx + 1}`}
        </p>
        <div className="flex justify-center gap-2 overflow-x-auto px-6">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              className={`shrink-0 overflow-hidden rounded-lg transition-all ${
                i === idx
                  ? "ring-2 ring-white ring-offset-2 ring-offset-black"
                  : "opacity-50 hover:opacity-80"
              }`}
            >
              <img src={src} alt={ROOM_LABELS[i] ?? ""} className="h-14 w-20 object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Airbnb-Style Mosaic Gallery ────────────────────────────────────────────────
function MosaicGallery({
  images,
  title,
  onShowAll,
  onOpenAt,
}: {
  images: string[];
  title: string;
  onShowAll: () => void;
  onOpenAt: (i: number) => void;
}) {
  const main = images[0];
  const side = images.slice(1, 5);

  return (
    <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
      <div className="grid h-[420px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl">
        {/* Large left */}
        <button
          type="button"
          onClick={() => onOpenAt(0)}
          className="group col-span-2 row-span-2 overflow-hidden"
        >
          <img
            src={main}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </button>

        {/* 4 right tiles */}
        {[0, 1, 2, 3].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onOpenAt(i + 1)}
            className="group overflow-hidden"
          >
            <img
              src={side[i] ?? main}
              alt={ROOM_LABELS[i + 1] ?? `view ${i + 2}`}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {/* Show all button */}
      <button
        type="button"
        onClick={onShowAll}
        className="absolute bottom-4 right-12 flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-lg hover:bg-gray-50 transition lg:right-12"
      >
        <Grid3x3 className="h-4 w-4" />
        Show all {images.length} photos
      </button>
    </div>
  );
}

// ── Landlord Card ─────────────────────────────────────────────────────────────
function LandlordCard({ landlord, ownerName, ownerRole }: {
  landlord: LandlordProfile | null;
  ownerName?: string;
  ownerRole?: string;
}) {
  const name = landlord?.name ?? ownerName ?? "Verified Landlord";
  const role = landlord?.role ?? ownerRole ?? "LANDLORD";
  const joinYear = landlord ? new Date(landlord.createdAt).getFullYear() : null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-600 text-2xl font-black text-white shadow-lg">
            {getInitials(name)}
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
            <CheckCircle2 className="h-3 w-3 text-white" />
          </span>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900">{name}</p>
          <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
            role === "DEVELOPER"
              ? "bg-amber-100 text-amber-700"
              : "bg-indigo-100 text-indigo-700"
          }`}>
            {role === "DEVELOPER" ? "Developer" : "Landlord"}
          </span>
        </div>
      </div>

      {landlord && (
        <>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { val: landlord.totalListings, label: "Listings", color: "text-gray-900" },
              { val: landlord.propertiesSoldOrRented, label: "Closed Deals", color: "text-gray-900" },
              { val: landlord.availableListings, label: "Available", color: "text-emerald-600" },
            ].map(({ val, label, color }) => (
              <div key={label} className="rounded-xl bg-gray-50 py-3 text-center">
                <p className={`text-2xl font-black ${color}`}>{val}</p>
                <p className="mt-0.5 text-[11px] text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          {joinYear && (
            <div className="mt-4 flex items-center gap-1.5 text-sm text-gray-500">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              Listing on HomePath since {joinYear}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [landlord, setLandlord] = useState<LandlordProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryStart, setGalleryStart] = useState(0);

  useEffect(() => {
    setSavedIds(getSavedPropertyIds());
    fetchProperty(id)
      .then((p) => {
        setProperty(p);
        if (p.ownerId) {
          fetchLandlordProfile(p.ownerId).then(setLandlord).catch(() => {});
        }
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Property not found"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = () => {
    if (!property) return;
    toggleSavedProperty(property.id);
    setSavedIds(getSavedPropertyIds());
  };

  const openGallery = (i = 0) => {
    setGalleryStart(i);
    setGalleryOpen(true);
  };

  // ── Loading / Error ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm text-gray-400">Loading property…</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <p className="text-gray-500">{error ?? "Property not found"}</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          ← Go back
        </button>
      </div>
    );
  }

  const images =
    property.galleryImages?.length
      ? property.galleryImages
      : [property.imageUrl ?? FALLBACK_IMAGES[0], ...FALLBACK_IMAGES.slice(1)];

  const isSaved = savedIds.includes(property.id);
  const trustScore = property.trustScore?.score;
  const bathrooms = Math.max(1, property.bedrooms - 1);
  const monthlyPrice = Math.round(Number(property.price) / 12);

  return (
    <>
      {/* Full-screen gallery modal */}
      {galleryOpen && (
        <GalleryModal
          images={images}
          startIdx={galleryStart}
          onClose={() => setGalleryOpen(false)}
        />
      )}

      <div className="min-h-screen bg-white">
        {/* ── Nav bar ───────────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:px-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              <ArrowLeft className="h-4 w-4" /> Back to listings
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isSaved
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Heart className={`h-4 w-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                {isSaved ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mosaic Gallery ─────────────────────────────────────────────────── */}
        <div className="py-6">
          <MosaicGallery
            images={images}
            title={property.title}
            onShowAll={() => openGallery(0)}
            onOpenAt={openGallery}
          />
        </div>

        {/* ── Main Content ───────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-6xl px-4 pb-20 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_380px]">

            {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
            <div className="space-y-10">

              {/* Title section */}
              <div className="border-b border-gray-100 pb-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${
                    property.listingType === "RENT"
                      ? "bg-emerald-500 text-white"
                      : "bg-violet-600 text-white"
                  }`}>
                    {property.listingType === "RENT" ? "For Rent" : "For Sale"}
                  </span>
                  {property.status === "AVAILABLE" && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Available Now
                    </span>
                  )}
                </div>

                <h1 className="mt-4 text-4xl font-extrabold leading-tight text-gray-950">
                  {property.title}
                </h1>

                <div className="mt-3 flex items-center gap-1.5 text-base text-gray-500">
                  <MapPin className="h-4 w-4 shrink-0 text-indigo-400" />
                  {property.address}
                </div>

                {/* Spec pills */}
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {[
                    { Icon: Bed, label: `${property.bedrooms} Bed${property.bedrooms > 1 ? "s" : ""}` },
                    { Icon: Bath, label: `${bathrooms} Bath${bathrooms > 1 ? "s" : ""}` },
                    { Icon: Home, label: formatArea(property.areaKey) },
                  ].map(({ Icon, label }) => (
                    <span key={label} className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
                      <Icon className="h-4 w-4 text-indigo-500" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="border-b border-gray-100 pb-8">
                <h2 className="mb-4 text-xl font-bold text-gray-900">About this home</h2>
                <p className="text-[15px] leading-8 text-gray-600">
                  {property.description ??
                    "A well-kept home with a convenient location and verified details. Contact the landlord for a viewing."}
                </p>
              </div>

              {/* ── Photo Tour ────────────────────────────────────────────── */}
              <div className="border-b border-gray-100 pb-8">
                <h2 className="mb-6 text-xl font-bold text-gray-900">Photo Tour</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map((src, i) => {
                    const Icon = ROOM_ICONS[i] ?? Home;
                    const label = ROOM_LABELS[i] ?? `Photo ${i + 1}`;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => openGallery(i)}
                        className="group relative overflow-hidden rounded-2xl bg-gray-100"
                      >
                        <img
                          src={src}
                          alt={label}
                          className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <div className="absolute bottom-0 left-0 right-0 translate-y-full p-3 transition-transform duration-300 group-hover:translate-y-0">
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => openGallery(0)}
                  className="mt-4 flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
                >
                  <Grid3x3 className="h-4 w-4" />
                  View all {images.length} photos in full screen
                </button>
              </div>

              {/* ── Features ────────────────────────────────────────────────── */}
              <div className="border-b border-gray-100 pb-8">
                <h2 className="mb-5 text-xl font-bold text-gray-900">What this place offers</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {FEATURES.map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                        <Icon className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{label}</p>
                        <p className="text-xs text-gray-400">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Trust Score ─────────────────────────────────────────────── */}
              {property.trustScore && (
                <div className="border-b border-gray-100 pb-8">
                  <h2 className="mb-5 text-xl font-bold text-gray-900">HomePath Verified</h2>
                  <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
                    <div className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg">
                          <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Trust Score</p>
                          <p className="text-xs text-gray-500">
                            Registry: {property.trustScore.registryStatus}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-5xl font-black text-emerald-600">{trustScore}</p>
                        <p className="text-sm text-emerald-400">out of 100</p>
                      </div>
                    </div>
                    {/* Bar */}
                    <div className="mx-6 mb-2 h-2 overflow-hidden rounded-full bg-emerald-100">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                        style={{ width: `${trustScore}%` }}
                      />
                    </div>
                    <p className="px-6 pb-6 pt-3 text-sm leading-7 text-gray-600">
                      {property.trustScore.explanationText ||
                        "This property has been cross-referenced with land registry records and community verification reports."}
                    </p>
                  </div>
                </div>
              )}

              {/* ── Meet the Landlord ─────────────────────────────────────── */}
              <div>
                <h2 className="mb-5 text-xl font-bold text-gray-900">Meet your landlord</h2>
                <LandlordCard
                  landlord={landlord}
                  ownerName={property.owner?.name}
                  ownerRole={property.owner?.role}
                />
              </div>
            </div>

            {/* ── RIGHT STICKY COLUMN ─────────────────────────────────────── */}
            <div className="lg:sticky lg:top-[65px] lg:self-start">
              <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
                {/* Price */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white">
                  <p className="text-sm font-medium text-indigo-200">
                    {property.listingType === "RENT" ? "Annual Rent" : "Sale Price"}
                  </p>
                  <p className="mt-1 text-4xl font-black tracking-tight">
                    {formatPrice(property.price, property.listingType)}
                  </p>
                  {property.listingType === "RENT" && (
                    <p className="mt-1 text-sm text-indigo-200">
                      ≈ ₦{monthlyPrice.toLocaleString()} / month
                    </p>
                  )}
                </div>

                <div className="space-y-3 p-6">
                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-2 rounded-2xl bg-gray-50 p-3 text-center text-xs">
                    <div>
                      <p className="text-base font-bold text-gray-900">{property.bedrooms}</p>
                      <p className="text-gray-400">Beds</p>
                    </div>
                    <div className="border-x border-gray-200">
                      <p className="text-base font-bold text-gray-900">{bathrooms}</p>
                      <p className="text-gray-400">Baths</p>
                    </div>
                    <div>
                      <p className="text-base font-bold text-emerald-600">
                        {property.status === "AVAILABLE" ? "Open" : "Taken"}
                      </p>
                      <p className="text-gray-400">Status</p>
                    </div>
                  </div>

                  {/* Save */}
                  <button
                    type="button"
                    onClick={handleSave}
                    className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition-all ${
                      isSaved
                        ? "bg-red-50 text-red-600 ring-1 ring-red-200 hover:bg-red-100"
                        : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg"
                    }`}
                  >
                    {isSaved ? (
                      <><BookmarkCheck className="h-5 w-5" /> Saved to Wishlist</>
                    ) : (
                      <><Heart className="h-5 w-5" /> Save to Wishlist</>
                    )}
                  </button>

                  {/* Property doc */}
                  {property.document && (
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-2">
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        Legal Document Verified
                      </p>
                      {[
                        ["Type", property.document.documentType],
                        ["Plot No.", property.document.plotNumber],
                        ["Survey", property.document.surveyNumber],
                        ["Owner", property.document.attestedOwnerName],
                      ].map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">{k}</span>
                          <span className="font-semibold text-gray-700">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-center text-xs text-gray-400">
                    Contact landlord through HomePath for a viewing
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
