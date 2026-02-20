
import { prisma } from "@/lib/prisma"
import { Users, Server, Key } from "lucide-react"

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
        <div>
            <div className="mb-10">
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Admin Overview</h1>
                <p className="text-gray-400">Welcome back to the command center.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="card relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="w-24 h-24 text-blue-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400">
                            <Users className="w-6 h-6" />
                        </div>
                        <div className="text-3xl font-bold mb-1">{stats.userCount}</div>
                        <div className="text-sm text-gray-400 font-medium">Total Users</div>
                    </div>
                </div>

                <div className="card relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Key className="w-24 h-24 text-amber-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 text-amber-400">
                            <Key className="w-6 h-6" />
                        </div>
                        <div className="text-3xl font-bold mb-1">{stats.keyCount}</div>
                        <div className="text-sm text-gray-400 font-medium">Active API Keys</div>
                    </div>
                </div>

                <div className="card relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Server className="w-24 h-24 text-emerald-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-400">
                            <Server className="w-6 h-6" />
                        </div>
                        <div className="text-3xl font-bold mb-1">{stats.modelCount}</div>
                        <div className="text-sm text-gray-400 font-medium">Deployed Models</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
