import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { AiInsightsPreview } from "@/components/landing/ai-insights-preview";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Comparison } from "@/components/landing/comparison";
import { CtaBand } from "@/components/landing/cta-band";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <AiInsightsPreview />
        <HowItWorks />
        <Comparison />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
