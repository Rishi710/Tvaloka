import { HeroSlider } from "./components/HeroSlider";
import { BestSellers } from "./components/BestSellers";
import { CollectionShowcase } from "./components/CollectionShowcase";
import { ConcernSection } from "./components/ConcernSection";
import { RitualSpotlight } from "./components/RitualSpotlight";
import { TrustedTalesSection } from "./components/TrustedTalesSection";
import { Testimonials } from "./components/Testimonials";
import { TvalokaCode } from "./components/TvalokaCode";
import { LatestReads } from "./components/LatestReads";

// Stacked rails share one rhythm: the previous section's bottom padding already
// provides most of the gap, so the top padding steps in from small to the full
// desktop value rather than doubling it.
const stackedClass =
  "pt-[var(--space-1)] sm:pt-[var(--space-3)] lg:pt-[var(--space-6)]";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <HeroSlider />
      {/* <RitualSpotlight /> */}
      <BestSellers />
      <CollectionShowcase
        collectionHandle="new-launches"
        eyebrow="Just In"
        title="New Launches"
        className={stackedClass}
      />
      <ConcernSection className={stackedClass} />
      <CollectionShowcase
        collectionHandle="baby-care"
        eyebrow="Pure & Gentle"
        title="Baby Care"
        className={stackedClass}
      />
      <TrustedTalesSection />
      <TvalokaCode />
      <Testimonials />
      <CollectionShowcase
        collectionHandle="wellness-care"
        eyebrow="Daily Rituals"
        title="Wellness Care"
        className={stackedClass}
      />
      <LatestReads />
    </main>
  );
}
