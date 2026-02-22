"use client"
import dynamic from "next/dynamic"

const ParticleHeroDynamic = dynamic(() => import("./ParticleHero").then(mod => mod.ParticleHero), {
    ssr: false,
    loading: () => <div className="absolute inset-0 z-0 bg-[#F8F9FA]" />
})

export function ParticleHeroLoader() {
    return <ParticleHeroDynamic />
}
