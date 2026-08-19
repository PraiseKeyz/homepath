import { DeveloperCta } from "@/components/landing/developer-cta";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { JourneySection } from "@/components/landing/journey-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { StatsSection } from "@/components/landing/stats-section";
import { TrustScorePreview } from "@/components/landing/trust-score-preview";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <StatsSection />
        <HowItWorksSection />
        <TrustScorePreview />
        <JourneySection />
        <DeveloperCta />
      </main>
      <SiteFooter />
    </>
  );
}
