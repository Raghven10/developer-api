
import { prisma } from "@/lib/prisma"
import { Users, Server, Key, Activity, TrendingUp, Zap } from "lucide-react"

async function getStats() {
    const [userCount, keyCount, modelCount] = await Promise.all([
        prisma.user.count(),
        prisma.apiKey.count(),
        prisma.model.count()
    ])
    return { userCount, keyCount, modelCount }
}

export default async function AdminPage() {
    const stats = await getStats()

    return (
        <div className="max-w-6xl">
            <div className="mb-12">
                <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-1">System Overview</h1>
                        <div className="flex items-center gap-2 text-indigo-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                            <Activity className="w-3 h-3" /> Live Control Center
                        </div>
                    </div>
                </div>
                <p className="text-gray-400 max-w-2xl mt-4">
                    Monitor system performance, manage user access, and oversee deployed model resources from a centralized dashboard.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Users Card */}
                <div className="group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 glass border-white/5 hover:border-indigo-500/30">
                    <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700">
                        <Users className="w-48 h-48 text-indigo-400" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-all">
                            <Users className="w-7 h-7 text-indigo-400" />
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                            <div className="text-5xl font-black text-white">{stats.userCount}</div>
                            <div className="text-emerald-400 text-xs font-bold">+12%</div>
                        </div>
                        <div className="text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-indigo-400 transition-colors">
                            Total Platform Users
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* API Keys Card */}
                <div className="group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 glass border-white/5 hover:border-amber-500/30">
                    <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700">
                        <Key className="w-48 h-48 text-amber-400" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 border border-amber-500/20 group-hover:bg-amber-500/20 transition-all">
                            <Key className="w-7 h-7 text-amber-400" />
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                            <div className="text-5xl font-black text-white">{stats.keyCount}</div>
                            <div className="text-amber-400 text-xs font-bold">Active</div>
                        </div>
                        <div className="text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-amber-400 transition-colors">
                            Provisioned API Keys
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Models Card */}
                <div className="group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 glass border-white/5 hover:border-emerald-500/30">
                    <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700">
                        <Server className="w-48 h-48 text-emerald-400" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
                            <Server className="w-7 h-7 text-emerald-400" />
                        </div>
                        <div className="flex items-baseline gap-2 mb-2">
                            <div className="text-5xl font-black text-white">{stats.modelCount}</div>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-emerald-400 transition-colors">
                            Active Model Engines
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>

            {/* Recent Activity Mockup Section */}
            <div className="mt-12 p-8 rounded-3xl glass border-white/5 bg-white/[0.02]">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-400" /> Platform Growth
                </h3>
                <div className="h-48 w-full border border-white/5 rounded-2xl bg-black/40 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, gray 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                    </div>
                    <p className="text-gray-600 font-medium tracking-widest uppercase text-xs">Analytics Visualization Engine</p>
                </div>
            </div>
        </div>
    )
}
