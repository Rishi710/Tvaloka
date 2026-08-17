import { HeroSlider } from "./components/HeroSlider";
import { RitualSpotlight } from "./components/RitualSpotlight";
import { TrustedTales } from "./components/TrustedTales";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <HeroSlider />
      <RitualSpotlight />
      <TrustedTales />
    </main>
  );
}
