import { HeroOverlay } from "@/components/landing/HeroOverlay"
import { ParticleHeroLoader } from "@/components/landing/ParticleHeroLoader"
import { LandingNavbar } from "@/components/landing/LandingNavbar"
import { FeatureCards } from "@/components/landing/FeatureCards"

export default function Home() {
  return (
    <main className="relative min-h-screen break-words flex flex-col bg-[#F8F9FA]">
      <LandingNavbar />

      {/* The 3D Canvas covers the top section entirely */}
      <div className="relative w-full h-[90vh] min-h-[600px] flex-shrink-0">
        <ParticleHeroLoader />
        <HeroOverlay />
      </div>

      {/* Content Below the Hero */}
      <div id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24 pb-32">
        <div className="mb-20 text-center">
          <h2 className="text-3xl md:text-5xl font-medium mb-6 text-[#121317] tracking-tight">
            Built for Scale. Engineered for Speed.
          </h2>
          <p className="text-[#45474D] text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            Access state-of-the-art open source models through a single, unified API.
            Designed for developers who demand performance, privacy, and control.
          </p>
        </div>

        <FeatureCards />
      </div>

      <footer className="mt-auto border-t border-gray-100 py-10 text-center text-sm text-[#45474D] bg-white">
        <p>&copy; 2026 Silent Skylab. Built for the modern web.</p>
      </footer>
    </main>
  )
}
