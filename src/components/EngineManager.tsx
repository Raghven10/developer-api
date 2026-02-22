"use client"

import { useState, useTransition } from "react"
import { createEngine, toggleEngineStatus, deleteEngine } from "@/lib/actions"
import { Plus, Trash2, Activity, Power, PowerOff, Server, X, Loader2, CheckCircle, XCircle, AlertTriangle, Wifi } from "lucide-react"

type Engine = {
    id: string
    name: string
    type: string
    baseUrl: string
    apiKey: string | null
    isActive: boolean
    description: string | null
    createdAt: Date
    _count: { models: number }
}

type HealthResult = {
    status: "healthy" | "unhealthy" | "unreachable"
    latency: number | null
    models: string[]
    message: string
}

const ENGINE_TYPES = [
    { value: "ollama", label: "Ollama", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { value: "vllm", label: "vLLM", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    { value: "sglang", label: "SGLang", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    { value: "openai", label: "OpenAI-compatible", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    { value: "custom", label: "Custom", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
]

function getTypeBadge(type: string) {
    return ENGINE_TYPES.find(t => t.value === type) || ENGINE_TYPES[ENGINE_TYPES.length - 1]
}

export function EngineManager({ engines }: { engines: Engine[] }) {
    const [showForm, setShowForm] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [healthResults, setHealthResults] = useState<Record<string, HealthResult>>({})
    const [testingIds, setTestingIds] = useState<Set<string>>(new Set())
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    async function testConnection(engineId: string, baseUrl: string, type: string) {
        setTestingIds(prev => new Set(prev).add(engineId))
        try {
            const res = await fetch("/api/admin/engines/health", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ baseUrl, type, engineId })
            })
            const result = await res.json()
            setHealthResults(prev => ({ ...prev, [engineId]: result }))
        } catch {
            setHealthResults(prev => ({
                ...prev,
                [engineId]: { status: "unreachable", latency: null, models: [], message: "Request failed" }
            }))
        } finally {
            setTestingIds(prev => {
                const next = new Set(prev)
                next.delete(engineId)
                return next
            })
        }
    }

    function handleDelete(engineId: string) {
        setError(null)
        startTransition(async () => {
            try {
                await deleteEngine(engineId)
                setDeleteConfirmId(null)
            } catch (e: any) {
                setError(e.message)
                setDeleteConfirmId(null)
            }
        })
    }

    return (
        <div className="card border-white/5 bg-white/[0.02]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                        <Server className="w-6 h-6 text-indigo-400" />
                        Inference Engines
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Configure and orchestrate your distributed inference environment.
                    </p>
                </div>
                <button
                    onClick={() => { setShowForm(!showForm); setError(null) }}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${showForm
                        ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                        : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-600'
                        }`}
                >
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? "Cancel" : "Add Connection"}
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {/* Add Connection Form */}
            {showForm && (
                <div className="mb-10 p-6 rounded-3xl border border-white/5 bg-white/[0.03] shadow-2xl">
                    <h3 className="text-sm font-bold text-gray-300 mb-6 flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-indigo-400" /> New Connection Protocol
                    </h3>
                    <form
                        action={(formData) => {
                            startTransition(async () => {
                                try {
                                    await createEngine(formData)
                                    setShowForm(false)
                                    setError(null)
                                } catch (e: any) {
                                    setError(e.message)
                                }
                            })
                        }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">Friendly Name</label>
                            <input name="name" placeholder="e.g. Primary GPU Cluster" className="input" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">Orchestration Type</label>
                            <select name="type" className="input" required defaultValue="">
                                <option value="" disabled>Select runtime protocol…</option>
                                {ENGINE_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">Endpoint URL</label>
                            <input name="baseUrl" placeholder="https://api.inference.local" className="input" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">Access Token <span className="text-gray-700 font-normal normal-case">(optional)</span></label>
                            <input name="apiKey" type="password" placeholder="••••••••••••••••" className="input" />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">Metadata Description <span className="text-gray-700 font-normal normal-case">(optional)</span></label>
                            <input name="description" placeholder="A brief overview of this computational node..." className="input" />
                        </div>
                        <div className="md:col-span-2 flex justify-end pt-2">
                            <button type="submit" className="px-8 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-200 transition-all flex items-center gap-2 shadow-xl shadow-white/5" disabled={isPending}>
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Provision Endpoint</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Engines Table */}
            {engines.length === 0 ? (
                <div className="text-center py-16 rounded-3xl bg-white/[0.01] border border-dashed border-white/10">
                    <Server className="w-12 h-12 mx-auto mb-4 text-gray-600 opacity-50" />
                    <p className="text-sm font-bold text-gray-400">No active computational nodes discovered.</p>
                    <p className="text-xs text-gray-600 mt-1">Initialize a new connection to begin deployment.</p>
                </div>
            ) : (
                <div className="overflow-x-auto -mx-6 px-6 pb-4 custom-scrollbar">
                    <table className="w-full text-sm border-spacing-y-2 border-separate">
                        <thead>
                            <tr className="text-gray-500">
                                <th className="text-left text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6">Compute Node</th>
                                <th className="text-left text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6">Runtime</th>
                                <th className="text-left text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6">Connectivity</th>
                                <th className="text-left text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6 text-center">Resources</th>
                                <th className="text-left text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6">Lifecycle</th>
                                <th className="text-left text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6">Health</th>
                                <th className="text-right text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6">Operations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {engines.map((engine) => {
                                const badge = getTypeBadge(engine.type)
                                const health = healthResults[engine.id]
                                const isTesting = testingIds.has(engine.id)

                                return (
                                    <tr key={engine.id} className="group transition-all duration-300">
                                        <td className="py-4 px-6 bg-white/[0.02] group-hover:bg-white/[0.04] rounded-l-2xl border-y border-l border-white/5 group-hover:border-indigo-500/20 transition-all">
                                            <div className="font-bold text-white group-hover:text-indigo-400 transition-colors">{engine.name}</div>
                                            {engine.description && (
                                                <div className="text-[10px] text-gray-500 mt-1 font-medium">{engine.description}</div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 bg-white/[0.02] group-hover:bg-white/[0.04] border-y border-white/5 group-hover:border-indigo-500/20 transition-all">
                                            <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border tracking-wider ${badge.color}`}>
                                                {badge.label}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 bg-white/[0.02] group-hover:bg-white/[0.04] border-y border-white/5 group-hover:border-indigo-500/20 transition-all">
                                            <code className="text-[10px] text-indigo-400/80 bg-indigo-500/5 px-2.5 py-1.5 rounded-lg border border-indigo-500/10 active:scale-95 transition-transform cursor-pointer block w-fit">
                                                {engine.baseUrl}
                                            </code>
                                        </td>
                                        <td className="py-4 px-6 bg-white/[0.02] group-hover:bg-white/[0.04] border-y border-white/5 group-hover:border-indigo-500/20 transition-all text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-lg font-black text-white">{engine._count.models}</span>
                                                <span className="text-[9px] font-bold text-gray-600 uppercase">Models</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 bg-white/[0.02] group-hover:bg-white/[0.04] border-y border-white/5 group-hover:border-indigo-500/20 transition-all">
                                            <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${engine.isActive
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${engine.isActive ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-red-400'}`} />
                                                {engine.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 bg-white/[0.02] group-hover:bg-white/[0.04] border-y border-white/5 group-hover:border-indigo-500/20 transition-all">
                                            {isTesting ? (
                                                <span className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 animate-pulse">
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> ANALYZING…
                                                </span>
                                            ) : health ? (
                                                <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-wider ${health.status === "healthy" ? "text-emerald-400" :
                                                    health.status === "unhealthy" ? "text-amber-400" : "text-red-400"
                                                    }`}>
                                                    {health.status === "healthy" ? <CheckCircle className="w-3.5 h-3.5" /> :
                                                        health.status === "unhealthy" ? <AlertTriangle className="w-3.5 h-3.5" /> :
                                                            <XCircle className="w-3.5 h-3.5" />}
                                                    {health.latency ? `${health.latency}MS` : health.status}
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => testConnection(engine.id, engine.baseUrl, engine.type)}
                                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-gray-500 hover:text-indigo-400 transition-all group/test"
                                                >
                                                    <Wifi className="w-3.5 h-3.5 group-hover/test:scale-110 transition-transform" /> Diagnostic
                                                </button>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 bg-white/[0.02] group-hover:bg-white/[0.04] rounded-r-2xl border-y border-r border-white/5 group-hover:border-indigo-500/20 transition-all text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => testConnection(engine.id, engine.baseUrl, engine.type)}
                                                    className="p-2 rounded-xl bg-white/5 hover:bg-indigo-500/20 text-gray-500 hover:text-indigo-400 transition-all border border-transparent hover:border-indigo-500/20"
                                                    title="Run diagnostics"
                                                >
                                                    <Activity className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => startTransition(() => toggleEngineStatus(engine.id, !engine.isActive))}
                                                    className={`p-2 rounded-xl transition-all border border-transparent ${engine.isActive
                                                        ? 'bg-white/5 hover:bg-amber-500/20 text-gray-500 hover:text-amber-400 hover:border-amber-500/20'
                                                        : 'bg-white/5 hover:bg-emerald-500/20 text-gray-500 hover:text-emerald-400 hover:border-emerald-500/20'
                                                        }`}
                                                    title={engine.isActive ? "Override Deactivate" : "Initialize Activation"}
                                                >
                                                    {engine.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                                </button>
                                                {deleteConfirmId === engine.id ? (
                                                    <div className="flex items-center gap-2 ml-2">
                                                        <button
                                                            onClick={() => handleDelete(engine.id)}
                                                            className="text-[10px] font-bold px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                                                            disabled={isPending}
                                                        >
                                                            PURGE
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirmId(null)}
                                                            className="text-[10px] font-bold px-3 py-1.5 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition-all"
                                                        >
                                                            ABORT
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirmId(engine.id)}
                                                        className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
                                                        title="Decommission node"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Health Details Panel */}
            {Object.keys(healthResults).length > 0 && (
                <div className="mt-4 space-y-2">
                    {engines.map(engine => {
                        const health = healthResults[engine.id]
                        if (!health) return null
                        return (
                            <div
                                key={engine.id}
                                className={`p-3 rounded-lg text-xs flex items-start justify-between ${health.status === "healthy"
                                    ? "bg-green-500/5 border border-green-500/10 text-green-400"
                                    : health.status === "unhealthy"
                                        ? "bg-amber-500/5 border border-amber-500/10 text-amber-400"
                                        : "bg-red-500/5 border border-red-500/10 text-red-400"
                                    }`}
                            >
                                <div>
                                    <span className="font-medium">{engine.name}:</span> {health.message}
                                    {health.models.length > 0 && (
                                        <span className="text-gray-500 ml-2">
                                            ({health.models.length} model{health.models.length !== 1 ? 's' : ''}: {health.models.slice(0, 5).join(', ')}{health.models.length > 5 ? '…' : ''})
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => setHealthResults(prev => {
                                        const next = { ...prev }
                                        delete next[engine.id]
                                        return next
                                    })}
                                    className="ml-2 opacity-50 hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
