
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, Box, ArrowRight, Key } from "lucide-react"

async function getApps(userId: string, role?: string) {
    return await prisma.app.findMany({
        where: role === 'admin' ? undefined : { userId },
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { apiKeys: true } } }
    })
}

export default async function Dashboard() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/api/auth/signin")
    }

    const userId = session.user.id
    const role = (session.user as any).role
    const apps = await getApps(userId, role)

    return (
        <div className="w-full max-w-[1600px] mx-auto py-12 px-6 md:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">My Applications</h1>
                    <p className="text-gray-400 max-w-lg">
                        Manage your secure application environments and monitor API key usage in real-time.
                    </p>
                </div>
                <Link href="/dashboard/create" className="btn btn-primary px-8 py-3 text-sm font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all">
                    <Plus className="w-4 h-4 mr-2" /> Register your App
                </Link>
            </div>

            {apps.length === 0 ? (
                <div className="text-center py-24 rounded-3xl glass border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                        <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/10 group-hover:scale-110 transition-transform">
                            <Box className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">No applications found</h3>
                        <p className="text-gray-400 mb-8 max-w-xs mx-auto">Build your first production-ready application and start integrating our powerful APIs today.</p>
                        <Link href="/dashboard/create" className="btn btn-primary px-8">
                            <Plus className="w-4 h-4 mr-2" /> Get Started
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {apps.map((app: any) => (
                        <Link key={app.id} href={`/dashboard/${app.id}`}
                            className="group card relative overflow-hidden border-white/5 hover:border-indigo-500/30 transition-all duration-500"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="w-5 h-5 text-indigo-400" />
                            </div>

                            <div className="flex items-start justify-between mb-8">
                                <div className="p-3.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-all duration-500">
                                    <Box className="w-7 h-7 text-indigo-400" />
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/5 px-3 py-1.5 rounded-full border border-indigo-500/10 flex items-center gap-1.5">
                                        <Key className="w-3 h-3" /> {app._count.apiKeys} Keys
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                                    {app.name}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <span>Created {app.createdAt.toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Environment: Production</span>
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map((_, i) => (
                                        <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-gray-800" />
                                    ))}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
