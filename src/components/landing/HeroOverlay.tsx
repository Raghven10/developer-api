"use client"

import { useState, useEffect } from "react"
import { MonitorPlay, Apple } from "lucide-react"
import Link from "next/link"

const TypewriterText = ({ text, delay = 50 }: { text: string, delay?: number }) => {
    const [currentText, setCurrentText] = useState('')
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setCurrentText(prevText => prevText + text[currentIndex])
                setCurrentIndex(prevIndex => prevIndex + 1)
            }, delay)
            return () => clearTimeout(timeout)
        }
    }, [currentIndex, delay, text])

    return <span>{currentText}<span className="animate-pulse">|</span></span>
}

export function HeroOverlay() {
    return (
        <div className="absolute inset-0 z-10 flex flex-col justify-center items-center pointer-events-none px-6 sm:px-12 md:px-24 text-center mt-12">
            <div className="max-w-[1000px] pointer-events-auto flex flex-col items-center relative">

                {/* Soft glow/blur behind text for legibility over 3D particles */}
                <div className="absolute inset-0 top-1/2 -translate-y-1/2 w-[120%] left-[-10%] h-[160%] bg-[#F8F9FA]/60 blur-[80px] -z-10 rounded-full pointer-events-none" />

                {/* Branding — fade-in + slide-down */}
                <div
                    className="flex items-center gap-1.5 mb-6 text-[#45474D]"
                    style={{
                        animation: 'heroFadeSlideDown 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both',
                    }}
                >
                    <MonitorPlay className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-[15px] tracking-tight text-[#121317]">Silent Skylab</span>
                </div>

                {/* Clean, massive tight-tracked headline — fade-in + slide-up */}
                <h1
                    className="text-6xl md:text-[6.5rem] font-medium tracking-tighter leading-[1.05] mb-14 drop-shadow-sm"
                    style={{
                        animation: 'heroFadeSlideUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both',
                    }}
                >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                        <TypewriterText text="One API. Infinite intelligence. Controlled agents." delay={60} />
                    </span>
                </h1>

                {/* Antigravity Pill Buttons — fade-in + slide-up */}
                <div
                    className="flex flex-wrap justify-center items-center gap-4"
                    style={{
                        animation: 'heroFadeSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.8s both',
                    }}
                >
                    <Link
                        href="/api/auth/signin"
                        className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full transition-all text-[17px]"
                        style={{ transitionTimingFunction: 'cubic-bezier(.19, 1, .22, 1)', transitionDuration: '400ms' }}
                    >
                        <span>Start Building Now</span>
                    </Link>

                    <Link
                        href="/docs"
                        className="inline-flex items-center justify-center px-8 py-3.5 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#121317] font-medium rounded-full transition-all text-[17px]"
                        style={{ transitionTimingFunction: 'cubic-bezier(.19, 1, .22, 1)', transitionDuration: '400ms' }}
                    >
                        Read the Docs
                    </Link>
                </div>
            </div>

            {/* CSS Keyframe animations */}
            <style jsx>{`
                @keyframes heroFadeSlideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes heroFadeSlideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    )
}
