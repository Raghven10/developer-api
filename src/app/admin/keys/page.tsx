
import { prisma } from "@/lib/prisma"
import { toggleKeyStatus, deleteApiKeyAdmin, getPublicModels } from "@/lib/actions"
import { Key, Search, Shield, Server, Trash2 } from "lucide-react"
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
        <div className="max-w-6xl">
            {/* Header */}
            <div className="mb-12">
                <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Key className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-1">
                            Access Control
                        </h1>
                        <div className="flex items-center gap-2 text-amber-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                            <Shield className="w-3 h-3" /> API Credentials
                        </div>
                    </div>
                </div>
                <p className="text-gray-400 max-w-2xl mt-4">
                    Orchestrate and monitor API credentials across your ecosystem. Track usage metrics and manage access permissions for distributed applications.
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="group rounded-3xl p-6 glass border-white/5 hover:border-amber-500/30 transition-all duration-500">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500/20 transition-all">
                            <Key className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="text-3xl font-black text-white">{stats.total}</div>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-amber-400 transition-colors">Total Credentials</div>
                </div>

                <div className="group rounded-3xl p-6 glass border-white/5 hover:border-emerald-500/30 transition-all duration-500">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
                            <Shield className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="text-3xl font-black text-white">{stats.active}</div>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-emerald-400 transition-colors">Active Tokens</div>
                </div>

                <div className="group rounded-3xl p-6 glass border-white/5 hover:border-red-500/30 transition-all duration-500">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 group-hover:bg-red-500/20 transition-all">
                            <Server className="w-5 h-5 text-red-400" />
                        </div>
                        <div className="text-3xl font-black text-white">{stats.inactive}</div>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-red-400 transition-colors">Restricted / Expired</div>
                </div>
            </div>

            {/* Keys Table */}
            {keys.length === 0 ? (
                <div className="text-center py-16 rounded-3xl bg-white/[0.01] border border-dashed border-white/10">
                    <Key className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-50" />
                    <p className="text-sm font-bold text-gray-400">No active credentials discovered in the registry.</p>
                </div>
            ) : (
                <div className="overflow-x-auto -mx-6 px-6 pb-4 custom-scrollbar">
                    <table className="w-full text-sm border-spacing-y-2 border-separate">
                        <thead>
                            <tr className="text-gray-500">
                                <th className="text-left text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6">Identitfier</th>
                                <th className="text-left text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6">Secret Token</th>
                                <th className="text-left text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6">Origin</th>
                                <th className="text-left text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6">Application</th>
                                <th className="text-left text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6">Timestamp</th>
                                <th className="text-left text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6">Permissions</th>
                                <th className="text-left text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6">State</th>
                                <th className="text-right text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6">Operations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {keys.map((key: any, i: number) => (
                                <tr key={key.id} className="group transition-all duration-300">
                                    <td className="py-4 px-6 bg-white/[0.02] group-hover:bg-white/[0.04] rounded-l-2xl border-y border-l border-white/5 group-hover:border-amber-500/20 transition-all">
                                        <div className="font-bold text-white group-hover:text-amber-400 transition-colors uppercase tracking-tight">
                                            {key.name || "UNNAMED_NODE"}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 bg-white/[0.02] group-hover:bg-white/[0.04] border-y border-white/5 group-hover:border-amber-500/20 transition-all">
                                        <code className="hidden sm:block font-mono text-[10px] text-amber-400/80 bg-amber-500/5 px-2 py-1 rounded-md border border-amber-500/10">
                                            {key.key.substring(0, 8)}••••{key.key.substring(key.key.length - 4)}
                                        </code>
                                    </td>
                                    <td className="py-4 px-6 bg-white/[0.02] group-hover:bg-white/[0.04] border-y border-white/5 group-hover:border-amber-500/20 transition-all">
                                        <div className="text-[10px] text-gray-500 font-bold max-w-[120px] truncate" title={key.app.user.email}>
                                            {key.app.user.email}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 bg-white/[0.02] group-hover:bg-white/[0.04] border-y border-white/5 group-hover:border-amber-500/20 transition-all">
                                        <span className="text-[10px] font-black uppercase tracking-tighter text-gray-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                                            {key.app.name}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 bg-white/[0.02] group-hover:bg-white/[0.04] border-y border-white/5 group-hover:border-amber-500/20 transition-all">
                                        <div className="text-[11px] font-bold text-gray-500 font-mono">
                                            {key.createdAt.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 bg-white/[0.02] group-hover:bg-white/[0.04] border-y border-white/5 group-hover:border-amber-500/20 transition-all">
                                        <div className="flex flex-wrap gap-1">
                                            {key.models.length === 0 ? (
                                                <span className="text-[9px] font-bold text-gray-600 uppercase">Universal</span>
                                            ) : (
                                                key.models.slice(0, 2).map((m: any) => (
                                                    <span key={m.id} className="text-[8px] font-black bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/10 uppercase tracking-tighter">
                                                        {m.apiId}
                                                    </span>
                                                ))
                                            )}
                                            {key.models.length > 2 && (
                                                <span className="text-[8px] font-black bg-white/5 text-gray-500 px-1.5 py-0.5 rounded">+{key.models.length - 2}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 bg-white/[0.02] group-hover:bg-white/[0.04] border-y border-white/5 group-hover:border-amber-500/20 transition-all">
                                        <span className={`inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border transition-all ${key.active
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                            }`}>
                                            <span className={`w-1 h-1 rounded-full ${key.active ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]'}`} />
                                            {key.active ? "AUTHORIZED" : "PENDING"}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 bg-white/[0.02] group-hover:bg-white/[0.04] rounded-r-2xl border-y border-r border-white/5 group-hover:border-amber-500/20 transition-all text-right">
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
                                                <button className={`p-2 rounded-xl transition-all border border-transparent ${key.active
                                                    ? 'bg-white/5 hover:bg-amber-500/20 text-gray-500 hover:text-amber-400 hover:border-amber-500/20'
                                                    : 'bg-white/5 hover:bg-emerald-500/20 text-gray-500 hover:text-emerald-400 hover:border-emerald-500/20'
                                                    }`}>
                                                    {key.active ? <Shield className="w-4 h-4 opacity-50 group-hover:opacity-100" /> : <Shield className="w-4 h-4" />}
                                                </button>
                                            </form>
                                            <form action={async () => {
                                                "use server"
                                                await deleteApiKeyAdmin(key.id)
                                            }}>
                                                <button className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20">
                                                    <Trash2 className="w-4 h-4" />
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
