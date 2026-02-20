
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Shield, Server, Key, Cpu } from "lucide-react"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
        redirect("/")
    }

    return (
        <div className="container mt-8 pt-10 pb-10 px-6">
            <div className="flex flex-col md:flex-row gap-10 items-start">
                <aside className="w-full md:w-60 shrink-0">
                    <div className="p-5 space-y-1 sticky top-24 rounded-2xl" style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(148, 163, 184, 0.1)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' }}>
                        <div className="flex items-center gap-2 px-3 py-3 text-gray-400 font-bold uppercase text-xs tracking-wider border-b border-white/5 mb-3 pb-3">
                            <Shield className="w-4 h-4 text-[var(--primary)]" /> Admin Console
                        </div>
                        <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-indigo-500/10 hover:text-indigo-400 text-gray-300 text-sm">
                            <Shield className="w-4 h-4" /> Overview
                        </Link>
                        <Link href="/admin/models" className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-indigo-500/10 hover:text-indigo-400 text-gray-300 text-sm">
                            <Cpu className="w-4 h-4" /> Models & Engines
                        </Link>
                        <Link href="/admin/keys" className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-indigo-500/10 hover:text-indigo-400 text-gray-300 text-sm">
                            <Key className="w-4 h-4" /> Manage Keys
                        </Link>
                    </div>
                </aside>
                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    )
}
