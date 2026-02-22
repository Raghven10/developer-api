
"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MonitorPlay, LogOut, User } from "lucide-react"
import { NotificationDropdown } from "./NotificationDropdown"

export function Navbar() {
    const { data: session } = useSession()
    const pathname = usePathname()

    if (pathname === "/login" || pathname === "/") return null

    return (
        <nav className="border-b border-white/5 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight text-white group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all">
                        <MonitorPlay className="w-6 h-6 text-white" />
                    </div>
                    <span>DevPlatform</span>
                </Link>

                <div className="flex items-center gap-6">
                    <Link href="/docs" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                        Documentation
                    </Link>

                    {session ? (
                        <div className="flex items-center gap-6">
                            {session.user?.role === "admin" && (
                                <Link href="/admin" className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-all ${pathname.startsWith('/admin') ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>
                                    Admin
                                </Link>
                            )}
                            <Link href="/dashboard" className={`text-sm font-semibold transition-colors ${pathname.startsWith('/dashboard') ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}>
                                Dashboard
                            </Link>

                            {session.user?.role === "admin" && (
                                <NotificationDropdown />
                            )}

                            <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                                <div className="text-xs text-right hidden sm:block">
                                    <p className="text-white font-semibold">{session.user?.name}</p>
                                    <p className="text-gray-500 font-medium">{session.user?.email}</p>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="p-2.5 bg-white/5 hover:bg-red-500/10 rounded-xl text-gray-400 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
                                    title="Sign Out"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => signIn("keycloak")}
                            className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors shadow-lg shadow-white/10"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </nav>
    )
}
