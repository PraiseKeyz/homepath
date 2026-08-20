"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";

// Same value props as How It Works / the hero — TrustLayer, RentToOwn,
// Neighbourhood Intelligence, Accessibility — so the promo panel isn't filler.
const PROMO_SLIDES = [
  {
    title: "Know before you pay",
    description:
      "Real registry records and community reports tell you the truth about a property — before you commit a single naira.",
  },
  {
    title: "Save your way to ownership",
    description:
      "Join a cooperative savings group from ₦5,000/month — the same trust Nigerians already place in Ajo and Esusu, just tracked digitally.",
  },
  {
    title: "See the whole neighbourhood",
    description:
      "Flood risk, power reliability, safety, and commute time on every listing — not just a photo.",
  },
  {
    title: "Built for every Nigerian",
    description:
      "Core features reachable via WhatsApp and USSD, in a flow that doesn't assume a smartphone.",
  },
] as const;

const AUTO_ADVANCE_MS = 5000;

function AuthPromoPanel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = PROMO_SLIDES[activeSlide];

  const goPrev = () => {
    setActiveSlide((i) => (i === 0 ? PROMO_SLIDES.length - 1 : i - 1));
  };

  const goNext = () => {
    setActiveSlide((i) => (i === PROMO_SLIDES.length - 1 ? 0 : i + 1));
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((i) => (i === PROMO_SLIDES.length - 1 ? 0 : i + 1));
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="hidden min-h-screen flex-1 items-stretch p-4 lg:flex">
      <div className="flex flex-1 flex-col items-center justify-center rounded-[20px] bg-background-bg-brand-section px-8 py-16">
        <div className="flex max-w-[420px] flex-col items-center gap-8 text-center">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl leading-8 font-bold text-text-primary-on-brand">
              {slide.title}
            </h2>
            <p className="text-base leading-6 font-medium text-text-tertiary-on-brand">
              {slide.description}
            </p>
          </div>

          <div className="flex w-full items-center justify-center gap-16">
            <button
              type="button"
              onClick={goPrev}
              className="inline-flex size-9 items-center justify-center rounded-full text-text-primary-on-brand transition-colors hover:bg-white/10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>

            <div className="flex items-center gap-3">
              {PROMO_SLIDES.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={`size-2.5 rounded-full transition-colors ${
                    index === activeSlide
                      ? "bg-foreground-fg-white"
                      : "bg-foreground-fg-brand-secondary-500"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === activeSlide ? "true" : undefined}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={goNext}
              className="inline-flex size-9 items-center justify-center rounded-full text-text-primary-on-brand transition-colors hover:bg-white/10"
              aria-label="Next slide"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthLayout({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen bg-background-bg-primary">
      <section className="relative flex min-h-screen min-w-[min(100%,480px)] flex-1 flex-col">
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center gap-2 text-base font-bold text-text-primary-900"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-button-primary-default text-sm text-text-primary-on-brand">
            H
          </span>
          HomePath
        </Link>

        <div className="flex flex-1 items-center justify-center px-8 py-24">
          <div className="w-full max-w-[360px]">
            <div className="mb-8 flex flex-col gap-3">
              <h1 className="text-4xl leading-[44px] font-bold tracking-[-0.72px] text-text-primary-900">
                {title}
              </h1>
              <p className="text-base leading-6 text-text-tertiary-600">
                {subtitle}
              </p>
            </div>

            {children}

            <p className="mt-6 text-sm text-text-tertiary-600">{footer}</p>
          </div>
        </div>

        <p className="absolute bottom-8 left-8 text-sm leading-5 text-text-tertiary-600">
          © HomePath 2026
        </p>
      </section>

      <AuthPromoPanel />
    </div>
  );
}
