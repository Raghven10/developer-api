"use client"

import Link from "next/link"
import { MonitorPlay } from "lucide-react"
import { useSession } from "next-auth/react"

export function LandingNavbar() {
    const { data: session, status } = useSession()
    const appName = process.env.NEXT_PUBLIC_APP_NAME || "Developer Platform"

    return (
        <nav className="absolute top-0 w-full z-50 flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-12">
                <Link href="/" className="flex items-center gap-2 font-medium text-lg text-[#121317]">
                    <MonitorPlay className="w-5 h-5 text-indigo-600" />
                    <span className="tracking-tight">{appName}</span>
                </Link>

                <div className="hidden md:flex items-center gap-6 text-[15px] font-medium text-[#45474D]">
                    <Link href="/" className="hover:text-black transition-colors">
                        Home
                    </Link>
                    <Link href="/docs" className="hover:text-black transition-colors">
                        Documentation
                    </Link>
                    <Link href="/about" className="hover:text-black transition-colors">
                        About
                    </Link>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {status !== "loading" && (
                    session ? (
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full transition-all text-[15px]"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <Link
                            href="/api/auth/signin"
                            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#121317] hover:bg-[#2F3034] text-white font-medium rounded-full transition-all text-[15px]"
                        >
                            Sign In
                        </Link>
                    )
                )}
            </div>
        </nav>
    )
}
