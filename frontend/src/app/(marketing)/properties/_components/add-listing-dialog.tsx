"use client";

import { Plus, X } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ApiError, createProperty, type PropertyListingType } from "@/lib/api";
import { getToken } from "@/lib/auth";

const DEFAULT_FORM = {
  title: "",
  description: "",
  price: "",
  bedrooms: "2",
  address: "",
  areaKey: "ojodu",
  listingType: "RENT" as PropertyListingType,
  imageUrl: "",
};

export function AddListingDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const nextRowId = useRef(1);
  const [galleryRows, setGalleryRows] = useState([{ id: 0, url: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateGalleryUrl(id: number, url: string) {
    setGalleryRows((rows) =>
      rows.map((row) => (row.id === id ? { ...row, url } : row)),
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const token = getToken();
    if (!token) return;

    setError(null);
    setIsSubmitting(true);
    try {
      const galleryImages = galleryRows
        .map((row) => row.url.trim())
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
        imageUrl: form.imageUrl || undefined,
        galleryImages: galleryImages.length > 0 ? galleryImages : undefined,
      });
      setForm(DEFAULT_FORM);
      setGalleryRows([{ id: 0, url: "" }]);
      nextRowId.current = 1;
      setOpen(false);
      onCreated();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not create listing.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Plus className="h-4 w-4" />
          Add listing
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New property listing</DialogTitle>
          <DialogDescription>
            Fill in the details buyers and renters will see on the listing.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="max-h-[70vh] space-y-4 overflow-y-auto pr-1"
        >
          <div className="space-y-1.5">
            <Label htmlFor="listing-title">Title</Label>
            <Input
              id="listing-title"
              required
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              placeholder="2-bedroom flat, Ojodu"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="listing-price">Price (₦)</Label>
              <Input
                id="listing-price"
                type="number"
                required
                min={0}
                value={form.price}
                onChange={(event) =>
                  setForm({ ...form, price: event.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="listing-bedrooms">Bedrooms</Label>
              <Input
                id="listing-bedrooms"
                type="number"
                required
                min={0}
                value={form.bedrooms}
                onChange={(event) =>
                  setForm({ ...form, bedrooms: event.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="listing-address">Address</Label>
            <Input
              id="listing-address"
              required
              value={form.address}
              onChange={(event) =>
                setForm({ ...form, address: event.target.value })
              }
              placeholder="12 Ogunlana Street, Ojodu, Lagos"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="listing-area">Area key</Label>
              <Input
                id="listing-area"
                required
                value={form.areaKey}
                onChange={(event) =>
                  setForm({ ...form, areaKey: event.target.value })
                }
                placeholder="ojodu"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="listing-type">Listing type</Label>
              <Select
                id="listing-type"
                value={form.listingType}
                onChange={(event) =>
                  setForm({
                    ...form,
                    listingType: event.target.value as PropertyListingType,
                  })
                }
              >
                <option value="RENT">For rent</option>
                <option value="SALE">For sale</option>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="listing-description">Description (optional)</Label>
            <textarea
              id="listing-description"
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              className="min-h-24 w-full rounded-lg border border-border-primary bg-background-bg-primary px-3.5 py-2 text-sm text-text-primary-900 placeholder:text-text-placeholder focus-visible:ring-2 focus-visible:ring-effects-focus-rings-focus-ring focus-visible:outline-none"
              placeholder="A well-kept home with a convenient location…"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="listing-image">Cover image URL (optional)</Label>
            <Input
              id="listing-image"
              value={form.imageUrl}
              onChange={(event) =>
                setForm({ ...form, imageUrl: event.target.value })
              }
              placeholder="https://…"
            />
          </div>

          <div className="space-y-2">
            <Label>Gallery image URLs (optional)</Label>
            {galleryRows.map((row) => (
              <div key={row.id} className="flex items-center gap-2">
                <Input
                  value={row.url}
                  onChange={(event) =>
                    updateGalleryUrl(row.id, event.target.value)
                  }
                  placeholder="https://…"
                />
                {galleryRows.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setGalleryRows((rows) =>
                        rows.filter((r) => r.id !== row.id),
                      )
                    }
                    className="shrink-0 rounded-full p-1.5 text-text-quaternary-500 hover:bg-background-bg-secondary-hover hover:text-utility-error-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setGalleryRows((rows) => [
                  ...rows,
                  { id: nextRowId.current++, url: "" },
                ])
              }
              className="text-xs font-semibold text-text-brand-secondary-700 hover:underline"
            >
              + Add another photo
            </button>
          </div>

          {error && (
            <p className="text-sm text-text-error-primary-600">{error}</p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Publishing…" : "Publish listing"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
