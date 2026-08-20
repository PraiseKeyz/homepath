"use client";

import { ChevronLeft, ChevronRight, Grid3x3, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const ROOM_LABELS = [
  "Exterior",
  "Kitchen",
  "Bathroom",
  "Bedroom",
  "Living room",
  "Surroundings",
];

function GalleryModal({
  images,
  startIndex,
  onClose,
}: {
  images: string[];
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );
  const next = useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length],
  );

  useEffect(() => {
    function handler(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") prev();
      if (event.key === "ArrowRight") next();
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next, onClose]);

  return (
    <div className="fixed inset-0 z-100 flex flex-col bg-background-bg-overlay">
      <div className="flex items-center justify-between px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-text-white transition-colors hover:bg-white/20"
        >
          <X className="h-4 w-4" /> Close
        </button>
        <span className="text-sm font-medium text-text-white/60">
          {index + 1} / {images.length}
        </span>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-16">
        <button
          type="button"
          onClick={prev}
          className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-text-white transition-colors hover:bg-white/25"
          aria-label="Previous photo"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={index}
          src={images[index]}
          alt={ROOM_LABELS[index] ?? `Photo ${index + 1}`}
          className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-effects-shadows-shadow-xl"
        />

        <button
          type="button"
          onClick={next}
          className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-text-white transition-colors hover:bg-white/25"
          aria-label="Next photo"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <div className="flex justify-center gap-2 overflow-x-auto px-6 pt-4 pb-6">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setIndex(i)}
            className={`shrink-0 overflow-hidden rounded-lg transition-opacity ${
              i === index
                ? "opacity-100 ring-2 ring-white"
                : "opacity-50 hover:opacity-80"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={ROOM_LABELS[i] ?? ""}
              className="h-14 w-20 object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function PropertyGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryStart, setGalleryStart] = useState(0);

  function openAt(index: number) {
    setGalleryStart(index);
    setGalleryOpen(true);
  }

  const main = images[0];
  const side = images.slice(1, 5);

  return (
    <>
      {galleryOpen && (
        <GalleryModal
          images={images}
          startIndex={galleryStart}
          onClose={() => setGalleryOpen(false)}
        />
      )}

      <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
        <div className="grid h-[420px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl">
          <button
            type="button"
            onClick={() => openAt(0)}
            className="group col-span-2 row-span-2 overflow-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={main}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </button>

          {[0, 1, 2, 3].map((i) => (
            <button
              key={`tile-${side[i] ?? main}`}
              type="button"
              onClick={() => openAt(i + 1)}
              className="group overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={side[i] ?? main}
                alt={ROOM_LABELS[i + 1] ?? `View ${i + 2}`}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </button>
          ))}
        </div>

        {images.length > 1 && (
          <button
            type="button"
            onClick={() => openAt(0)}
            className="absolute right-8 bottom-4 flex items-center gap-2 rounded-xl border border-border-secondary bg-background-bg-primary px-4 py-2 text-sm font-semibold text-text-secondary-700 shadow-effects-shadows-shadow-lg hover:bg-background-bg-secondary-hover"
          >
            <Grid3x3 className="h-4 w-4" />
            Show all {images.length} photos
          </button>
        )}
      </div>
    </>
  );
}
