
"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MonitorPlay, LogOut, User } from "lucide-react"
import { NotificationDropdown } from "./NotificationDropdown"

export function Navbar() {
    const { data: session } = useSession()
    const pathname = usePathname()

    if (pathname === "/login") return null

    return (
        <nav className="border-b border-[var(--border)] bg-[var(--surface)]/50 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[var(--primary)]">
                    <MonitorPlay className="w-6 h-6" />
                    <span>DevPlatform</span>
                </Link>

                <div className="flex items-center gap-4">
                    <Link href="/docs" className="text-sm text-gray-400 hover:text-white transition-colors">
                        Documentation
                    </Link>

                    {session ? (
                        <div className="flex items-center gap-4">
                            {session.user?.role === "admin" && (
                                <Link href="/admin" className="text-sm font-bold text-red-400 hover:text-white transition-colors border border-red-900/50 px-2 py-1 rounded bg-red-900/20">
                                    Admin
                                </Link>
                            )}
                            <Link href="/dashboard" className="text-sm hover:text-[var(--primary)] transition-colors">
                                Dashboard
                            </Link>

                            {session.user?.role === "admin" && (
                                <NotificationDropdown />
                            )}

                            <div className="flex items-center gap-2 pl-4 border-l border-[var(--border)]">
                                <div className="text-xs text-right hidden sm:block">
                                    <p className="text-white font-medium">{session.user?.name}</p>
                                    <p className="text-gray-500">{session.user?.email}</p>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="p-2 hover:bg-[var(--surface-hover)] rounded-full text-gray-400 hover:text-red-400 transition-colors"
                                    title="Sign Out"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => signIn("keycloak")}
                            className="btn btn-primary text-sm"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </nav>
    )
}
