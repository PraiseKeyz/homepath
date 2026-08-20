import { DeveloperCta } from "./_components/developer-cta";
import { HeroSection } from "./_components/hero-section";
import { HowItWorksSection } from "./_components/how-it-works-section";
import { JourneySection } from "./_components/journey-section";
import { StatsSection } from "./_components/stats-section";
import { TrustScorePreview } from "./_components/trust-score-preview";

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <TrustScorePreview />
      <JourneySection />
      <DeveloperCta />
    </>
  );
}
