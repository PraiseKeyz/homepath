"use client";

import {
  Bath,
  Bed,
  BookmarkCheck,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  Loader2,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ApiError,
  createProperty,
  fetchProperties,
  getSavedPropertyIds,
  toggleSavedProperty,
  type Property,
} from "@/lib/api";
import { getStoredUser, getToken } from "@/lib/auth";

// ── Helpers ─────────────────────────────────────────────────────────────────
const GALLERY_FALLBACKS = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=800&q=80",
];

function formatPrice(price: string | number, listingType: string) {
  const n = Number(price);
  if (n >= 1_000_000)
    return `₦${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M${listingType === "RENT" ? "/yr" : ""}`;
  return `₦${n.toLocaleString()}${listingType === "RENT" ? "/yr" : ""}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ── Default form state ───────────────────────────────────────────────────────
const DEFAULT_GALLERY_ROWS = [
  { label: "Exterior / Front View", url: "" },
  { label: "Living Room", url: "" },
  { label: "Kitchen", url: "" },
  { label: "Bathroom", url: "" },
  { label: "Bedroom", url: "" },
  { label: "Surrounding / Neighbourhood", url: "" },
];

const DEFAULT_FORM = {
  title: "",
  description: "",
  price: "",
  bedrooms: "2",
  address: "",
  areaKey: "ojodu",
  listingType: "RENT" as "RENT" | "SALE",
  coverImage: GALLERY_FALLBACKS[0],
};

// ── Property Card ────────────────────────────────────────────────────────────
function PropertyCard({
  property,
  isSaved,
  onSave,
  onClick,
}: {
  property: Property;
  isSaved: boolean;
  onSave: () => void;
  onClick: () => void;
}) {
  const image = property.imageUrl ?? GALLERY_FALLBACKS[0];
  const trustScore = property.trustScore?.score;

  return (
    <article
      onClick={onClick}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Listing type badge */}
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
            property.listingType === "RENT"
              ? "bg-emerald-500 text-white"
              : "bg-violet-600 text-white"
          }`}
        >
          {property.listingType === "RENT" ? "For Rent" : "For Sale"}
        </span>

        {/* Save button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSave();
          }}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow backdrop-blur-sm transition-transform hover:scale-110"
          aria-label={isSaved ? "Remove from saved" : "Save listing"}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${isSaved ? "fill-red-500 text-red-500" : "text-gray-500"}`}
          />
        </button>

        {/* Price on image bottom */}
        <div className="absolute bottom-3 left-3">
          <span className="rounded-lg bg-black/70 px-2.5 py-1 text-sm font-bold text-white backdrop-blur-sm">
            {formatPrice(property.price, property.listingType)}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 text-[15px] font-semibold text-gray-900">
          {property.title}
        </h3>

        <div className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span className="line-clamp-1">{property.address}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <Bed className="h-3.5 w-3.5 text-gray-400" />
            {property.bedrooms} bed{property.bedrooms !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-3.5 w-3.5 text-gray-400" />
            {Math.max(1, property.bedrooms - 1)} bath
          </span>
        </div>

        {/* Footer row */}
        <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-2">
          <span
            className={`flex items-center gap-1 text-xs font-medium ${
              trustScore && trustScore >= 70
                ? "text-emerald-600"
                : trustScore
                  ? "text-amber-600"
                  : "text-gray-400"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {trustScore ? `${trustScore}/100` : "Unverified"}
          </span>

          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
              {getInitials(property.owner?.name ?? "LL")}
            </span>
            {property.owner?.name ?? "Landlord"}
          </span>
        </div>
      </div>
    </article>
  );
}

// ── Add Listing Form ─────────────────────────────────────────────────────────
function AddListingPanel({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [galleryRows, setGalleryRows] = useState(DEFAULT_GALLERY_ROWS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateGalleryRow = (idx: number, url: string) => {
    setGalleryRows((rows) =>
      rows.map((r, i) => (i === idx ? { ...r, url } : r)),
    );
  };

  const addGalleryRow = () =>
    setGalleryRows((rows) => [...rows, { label: "Additional Photo", url: "" }]);

  const removeGalleryRow = (idx: number) =>
    setGalleryRows((rows) => rows.filter((_, i) => i !== idx));

  const submit = async () => {
    const token = getToken();
    if (!token) return;
    try {
      setSaving(true);
      setError(null);
      const galleryImages = galleryRows
        .map((r) => r.url.trim())
        .filter(Boolean);
      await createProperty(token, {
        title: form.title,
        description: form.description || undefined,
        listingType: form.listingType,
        price: Number(form.price),
        bedrooms: Number(form.bedrooms),
        address: form.address,
        lat: 6.5244,
        lng: 3.3792,
        areaKey: form.areaKey,
        imageUrl: form.coverImage || GALLERY_FALLBACKS[0],
        galleryImages:
          galleryImages.length > 0
            ? galleryImages
            : [form.coverImage || GALLERY_FALLBACKS[0]],
      });
      setForm(DEFAULT_FORM);
      setGalleryRows(DEFAULT_GALLERY_ROWS);
      setOpen(false);
      onCreated();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not create listing",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-1">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
        >
          <Plus className="h-5 w-5" />
          Add New Listing
        </button>
      ) : (
        <div className="space-y-6 p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <Building2 className="h-4 w-4 text-indigo-500" />
              New Property Listing
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Basic info */}
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Property title"
            />
            <Input
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="Price (₦)"
              type="number"
            />
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Full address"
              className="md:col-span-2"
            />
            <Input
              value={form.bedrooms}
              onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
              placeholder="Bedrooms"
              type="number"
            />
            <select
              value={form.listingType}
              onChange={(e) =>
                setForm({
                  ...form,
                  listingType: e.target.value as "RENT" | "SALE",
                })
              }
              className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800"
            >
              <option value="RENT">For Rent</option>
              <option value="SALE">For Sale</option>
            </select>
            <Input
              value={form.areaKey}
              onChange={(e) => setForm({ ...form, areaKey: e.target.value })}
              placeholder="Area key (e.g. lekki)"
            />
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Property description"
              rows={3}
              className="min-h-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 md:col-span-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* ── Images ─────────────────────────────────────────── */}
          <div className="space-y-4 rounded-2xl border border-indigo-100 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-800">Photos</h3>

            {/* Cover image */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                <span className="rounded bg-indigo-600 px-1.5 py-0.5 text-white">
                  MAIN COVER
                </span>
                This image shows on the listing card
              </label>
              <Input
                value={form.coverImage}
                onChange={(e) =>
                  setForm({ ...form, coverImage: e.target.value })
                }
                placeholder="Paste the main cover image URL…"
              />
              {form.coverImage && (
                <img
                  src={form.coverImage}
                  alt="Cover preview"
                  className="mt-2 h-40 w-full rounded-xl object-cover"
                  onError={(e) =>
                    ((e.target as HTMLImageElement).style.display = "none")
                  }
                />
              )}
            </div>

            {/* Gallery images */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Gallery Images (appear in full detail view)
              </p>
              {galleryRows.map((row, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-40 shrink-0 text-xs text-gray-500">
                      {row.label}
                    </span>
                    <Input
                      value={row.url}
                      onChange={(e) => updateGalleryRow(idx, e.target.value)}
                      placeholder="Paste image URL…"
                      className="flex-1"
                    />
                    {idx >= DEFAULT_GALLERY_ROWS.length && (
                      <button
                        type="button"
                        onClick={() => removeGalleryRow(idx)}
                        className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  {row.url && (
                    <img
                      src={row.url}
                      alt={row.label}
                      className="ml-[10.5rem] h-20 w-40 rounded-lg object-cover"
                      onError={(e) =>
                        ((e.target as HTMLImageElement).style.display = "none")
                      }
                    />
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addGalleryRow}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Add another photo
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
            >
              Cancel
            </button>
            <Button onClick={submit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                "Publish Listing"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Marketplace ─────────────────────────────────────────────────────────
export function PropertyMarketplace() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "RENT" | "SALE">("ALL");
  const [filterBeds, setFilterBeds] = useState<string>("ALL");
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    setUserRole(user?.role ?? null);
    setSavedIds(getSavedPropertyIds());
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProperties();
      setProperties(data);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not load listings",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (id: string) => {
    toggleSavedProperty(id);
    setSavedIds(getSavedPropertyIds());
  };

  const canCreate =
    userRole === "LANDLORD" || userRole === "DEVELOPER" || userRole === "AGENT";

  const filtered = useMemo(() => {
    let list = properties;
    if (showSaved) list = list.filter((p) => savedIds.includes(p.id));
    if (filterType !== "ALL")
      list = list.filter((p) => p.listingType === filterType);
    if (filterBeds !== "ALL")
      list = list.filter((p) => String(p.bedrooms) === filterBeds);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.areaKey.toLowerCase().includes(q),
      );
    }
    return list;
  }, [properties, filterType, filterBeds, search, showSaved, savedIds]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <Loader2 className="mb-4 h-10 w-10 animate-spin" />
        <p className="text-sm">Loading homes…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Browse Homes</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {filtered.length} listing{filtered.length !== 1 ? "s" : ""}{" "}
            available
          </p>
        </div>
        {savedIds.length > 0 && (
          <button
            type="button"
            onClick={() => setShowSaved((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
              showSaved
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <BookmarkCheck className="h-4 w-4" />
            Saved ({savedIds.length})
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, address or area…"
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 text-sm text-gray-800 shadow-sm outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {(["ALL", "RENT", "SALE"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 text-sm font-medium transition ${
                filterType === t
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t === "ALL" ? "All" : t === "RENT" ? "Rent" : "Buy"}
            </button>
          ))}
        </div>

        <select
          value={filterBeds}
          onChange={(e) => setFilterBeds(e.target.value)}
          className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="ALL">Any beds</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={String(n)}>
              {n} bed{n > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Landlord — Add Listing Panel */}
      {canCreate && <AddListingPanel onCreated={load} />}

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-24 text-center">
          <Home className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No listings found</p>
          <p className="mt-1 text-xs text-gray-400">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isSaved={savedIds.includes(property.id)}
              onSave={() => handleSave(property.id)}
              onClick={() => router.push(`/dashboard/home/${property.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
