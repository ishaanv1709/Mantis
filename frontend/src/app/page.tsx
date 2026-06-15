import { Hero } from "@/components/landing/hero";
import { BrandMarquee } from "@/components/landing/brand-marquee";
import { ProductMock } from "@/components/landing/product-mock";
import { ScreensCarousel } from "@/components/landing/screens-carousel";
import { StatsFloating } from "@/components/landing/stats-floating";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { Testimonials } from "@/components/landing/testimonials";
import { Faq } from "@/components/landing/faq";
import { CtaSection } from "@/components/landing/cta";

export default function Home() {
  return (
    <>
      <Hero />
      <BrandMarquee />
      <ProductMock />
      <ScreensCarousel />
      <StatsFloating />
      <FeatureGrid />
      <Testimonials />
      <Faq />
      <CtaSection />
    </>
  );
}
