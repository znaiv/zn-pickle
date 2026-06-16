import { BuiltFor } from "@/components/built-for";
import { CTABanner } from "@/components/cta-banner";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { MatchingModes } from "@/components/matching-modes";
import { Navbar } from "@/components/navbar";
import { OrganizerPreview } from "@/components/organizer-preview";
import { StatsBanner } from "@/components/stats-banner";
import { WhatChanges } from "@/components/what-changes";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsBanner />
        <BuiltFor />
        <WhatChanges />
        <OrganizerPreview />
        <HowItWorks />
        <MatchingModes />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
