import { HeroSlider } from "./components/HeroSlider";
import { FeaturedProducts } from "./components/FeaturedProducts";
import { RitualSpotlight } from "./components/RitualSpotlight";
import { TrustedTales } from "./components/TrustedTales";
import { LatestReads } from "./components/LatestReads";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <HeroSlider />
      {/* <FeaturedProducts /> */}
      <RitualSpotlight />
      <TrustedTales />
      <LatestReads />
    </main>
  );
}

