
import { prisma } from "@/lib/prisma"
import { toggleKeyStatus, deleteApiKeyAdmin, getPublicModels } from "@/lib/actions"
import { Key, Search, Shield, Server } from "lucide-react"
import { EditKeyModelsModal } from "@/components/EditKeyModelsModal"

async function getKeys() {
    return await prisma.apiKey.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            app: {
                include: {
                    user: true
                }
            },
            models: true
        },
        take: 100
    })
}

async function getKeyStats() {
    const [total, active, inactive] = await Promise.all([
        prisma.apiKey.count(),
        prisma.apiKey.count({ where: { active: true } }),
        prisma.apiKey.count({ where: { active: false } }),
    ])
    return { total, active, inactive }
}

export default async function AdminKeysPage() {
    const [keys, stats, publicModels] = await Promise.all([getKeys(), getKeyStats(), getPublicModels()])

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        API Keys
                    </h1>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
                        {stats.total} total
                    </span>
                </div>
                <p className="text-gray-400 text-sm">Manage all API keys across the platform.</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="card p-4 text-center">
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                    <div className="text-xs text-gray-400 mt-1">Total Keys</div>
                </div>
                <div className="card p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-400">{stats.active}</div>
                    <div className="text-xs text-gray-400 mt-1">Active</div>
                </div>
                <div className="card p-4 text-center">
                    <div className="text-2xl font-bold text-red-400">{stats.inactive}</div>
                    <div className="text-xs text-gray-400 mt-1">Inactive</div>
                </div>
            </div>

            {/* Keys Table */}
            {keys.length === 0 ? (
                <div className="text-center py-16 rounded-xl" style={{ border: '1px dashed rgba(148, 163, 184, 0.15)' }}>
                    <Key className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">No API keys found</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ background: 'rgba(30, 41, 59, 0.5)' }}>
                                <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">Name</th>
                                <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">Secret Key</th>
                                <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">Owner</th>
                                <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">App</th>
                                <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">Created</th>
                                <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">Expires</th>
                                <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-400" style={{ minWidth: '150px' }}>Models</th>
                                <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">Status</th>
                                <th className="text-right px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {keys.map((key: any, i: number) => (
                                <tr
                                    key={key.id}
                                    className="group transition-colors hover:bg-white/[0.02]"
                                    style={{ borderTop: i > 0 ? '1px solid rgba(148, 163, 184, 0.06)' : undefined }}
                                >
                                    <td className="px-5 py-4 font-medium text-white">
                                        {key.name || "Unnamed Key"}
                                    </td>
                                    <td className="px-5 py-4">
                                        <code className="font-mono text-xs text-indigo-400 bg-indigo-500/5 px-2.5 py-1 rounded-md ring-1 ring-indigo-500/10">
                                            {key.key.substring(0, 7)}...{key.key.substring(key.key.length - 4)}
                                        </code>
                                    </td>
                                    <td className="px-5 py-4 text-gray-400 text-xs">
                                        {key.app.user.email}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="text-xs font-medium text-gray-300 bg-white/5 px-2 py-1 rounded">
                                            {key.app.name}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                                        {key.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                                        {key.expiresAt
                                            ? key.expiresAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                            : "Never"
                                        }
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-wrap gap-1.5">
                                            {key.models.length === 0 ? (
                                                <span className="text-xs text-gray-500">None</span>
                                            ) : (
                                                key.models.map((m: any) => (
                                                    <span key={m.id} className="text-[10px] font-medium bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 truncate max-w-[120px]" title={m.name}>
                                                        {m.name}
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${key.active
                                            ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                                            : 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${key.active ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                                            {key.active ? "Active" : "Pending Approval"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <EditKeyModelsModal
                                                keyId={key.id}
                                                keyName={key.name || "Unnamed Key"}
                                                initialModelIds={key.models.map((m: any) => m.id)}
                                                publicModels={publicModels}
                                            />
                                            <form action={async () => {
                                                "use server"
                                                await toggleKeyStatus(key.id, !key.active)
                                            }}>
                                                <button className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${key.active
                                                    ? 'text-red-400 hover:bg-red-500/10 hover:ring-1 hover:ring-red-500/20'
                                                    : 'text-emerald-400 hover:bg-emerald-500/10 hover:ring-1 hover:ring-emerald-500/20'
                                                    }`}>
                                                    {key.active ? "Deactivate" : "Activate"}
                                                </button>
                                            </form>
                                            <form action={async () => {
                                                "use server"
                                                await deleteApiKeyAdmin(key.id)
                                            }}>
                                                <button className="text-xs font-medium px-3 py-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                                    Delete
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
