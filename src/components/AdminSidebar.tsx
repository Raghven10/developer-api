"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, Key, Cpu, Bell } from "lucide-react"

export function AdminSidebar() {
    const pathname = usePathname()

    const navItems = [
        { href: "/admin", label: "Overview", icon: Shield, exact: true },
        { href: "/admin/models", label: "Models & Engines", icon: Cpu },
        { href: "/admin/keys", label: "Manage Keys", icon: Key },
        { href: "/admin/notifications", label: "Notifications", icon: Bell },
    ]

    return (
        <aside className="w-full md:w-72 shrink-0 md:sticky md:top-28">
            <div className="relative group">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-b from-indigo-500/20 to-purple-600/10 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000" />

                <div className="relative p-5 space-y-2 rounded-[2rem] glass border-white/5 backdrop-blur-2xl">
                    <div className="flex items-center gap-3 px-4 py-4 mb-4 border-b border-white/5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                            <Shield className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-300">
                            Neural Console
                        </div>
                    </div>

                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = item.exact
                            ? pathname === item.href
                            : pathname.startsWith(item.href)

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group/nav flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${isActive
                                    ? 'text-white'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {/* Active Indicator */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl" />
                                )}

                                {/* Hover Indicator */}
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/nav:opacity-100 transition-opacity" />

                                <Icon className={`w-[18px] h-[18px] relative z-10 transition-transform group-hover/nav:scale-110 ${isActive ? 'text-indigo-400' : 'text-gray-500 group-hover/nav:text-gray-300'}`} />
                                <span className={`text-[13px] font-bold tracking-tight relative z-10 ${isActive ? 'font-black' : ''}`}>
                                    {item.label}
                                </span>

                                {isActive && (
                                    <div className="absolute left-0 w-1 h-1/2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                )}
                            </Link>
                        )
                    })}
                </div>
            </div>
        </aside>
    )
}
