"use client"

import { useEffect, useRef, useState } from "react"
import { Code, Key, Zap } from "lucide-react"

const features = [
    {
        icon: Zap,
        title: "Ultra Low Latency",
        description: "Powered by distributed GPU inference for optimized speeds. Get tokens faster than ever before with military-grade reliability.",
        accentBg: "bg-blue-50",
        accentText: "text-blue-600",
        hoverBorder: "hover:border-blue-200",
    },
    {
        icon: Code,
        title: "Simple Drop-in API",
        description: "100% compatibility with OpenAI SDKs. Change the base URL, supply your platform API key, and you're ready to deploy.",
        accentBg: "bg-indigo-50",
        accentText: "text-indigo-600",
        hoverBorder: "hover:border-indigo-200",
    },
    {
        icon: Key,
        title: "Advanced Key Management",
        description: "Granular control over API keys. Set limits, track organizational usage, and instantly revoke access from the command center.",
        accentBg: "bg-purple-50",
        accentText: "text-purple-600",
        hoverBorder: "hover:border-purple-200",
    },
]

export function FeatureCards() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.disconnect()
                }
            },
            { threshold: 0.15 }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    return (
        <>
            <div ref={containerRef} className="grid md:grid-cols-3 gap-8">
                {features.map((feat, i) => {
                    const Icon = feat.icon
                    return (
                        <div
                            key={feat.title}
                            className={`bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-lg ${feat.hoverBorder} transition-all duration-300`}
                            style={{
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
                                transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.15}s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.15}s`,
                            }}
                        >
                            <div className={`w-12 h-12 rounded-2xl ${feat.accentBg} flex items-center justify-center mb-6`}>
                                <Icon className={`w-6 h-6 ${feat.accentText}`} />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-[#121317]">{feat.title}</h3>
                            <p className="text-[#45474D] leading-relaxed">{feat.description}</p>
                        </div>
                    )
                })}
            </div>
        </>
    )
}
