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
                body: JSON.stringify({ baseUrl, type })
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
        <div className="card">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Server className="w-5 h-5 text-[var(--primary)]" />
                        Inference Engines
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Manage connections to Ollama, vLLM, SGLang, and other inference servers.
                    </p>
                </div>
                <button
                    onClick={() => { setShowForm(!showForm); setError(null) }}
                    className="btn btn-outline text-sm flex items-center gap-2"
                >
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? "Cancel" : "Add Connection"}
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}

            {/* Add Connection Form */}
            {showForm && (
                <div className="mb-6 p-5 rounded-xl border border-[var(--border)]" style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
                    <h3 className="text-sm font-bold text-gray-300 mb-4">New Inference Engine Connection</h3>
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
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-500 block mb-1">Connection Name</label>
                            <input name="name" placeholder="e.g. GPU Server - Ollama" className="input" required />
                        </div>
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-500 block mb-1">Engine Type</label>
                            <select name="type" className="input" required defaultValue="">
                                <option value="" disabled>Select engine type…</option>
                                {ENGINE_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-500 block mb-1">Base URL</label>
                            <input name="baseUrl" placeholder="http://localhost:11434" className="input" required />
                        </div>
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-500 block mb-1">API Key <span className="text-gray-600 normal-case">(optional)</span></label>
                            <input name="apiKey" type="password" placeholder="sk-..." className="input" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs uppercase font-bold text-gray-500 block mb-1">Description <span className="text-gray-600 normal-case">(optional)</span></label>
                            <input name="description" placeholder="Main GPU inference server" className="input" />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button type="submit" className="btn btn-primary" disabled={isPending}>
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Connection"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Engines Table */}
            {engines.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Server className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No inference engines configured yet.</p>
                    <p className="text-xs mt-1">Click "Add Connection" to get started.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 py-3 px-4">Name</th>
                                <th className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 py-3 px-4">Type</th>
                                <th className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 py-3 px-4">Base URL</th>
                                <th className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 py-3 px-4">Models</th>
                                <th className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 py-3 px-4">Status</th>
                                <th className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 py-3 px-4">Health</th>
                                <th className="text-right text-xs font-bold uppercase tracking-wider text-gray-500 py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {engines.map((engine) => {
                                const badge = getTypeBadge(engine.type)
                                const health = healthResults[engine.id]
                                const isTesting = testingIds.has(engine.id)

                                return (
                                    <tr key={engine.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-white">{engine.name}</div>
                                            {engine.description && (
                                                <div className="text-xs text-gray-500 mt-0.5">{engine.description}</div>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`text-xs px-2.5 py-1 rounded-full border ${badge.color}`}>
                                                {badge.label}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <code className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">{engine.baseUrl}</code>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-gray-300">{engine._count.models}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${engine.isActive
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${engine.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                                                {engine.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {isTesting ? (
                                                <span className="flex items-center gap-1.5 text-xs text-blue-400">
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Testing…
                                                </span>
                                            ) : health ? (
                                                <span className={`flex items-center gap-1.5 text-xs ${health.status === "healthy" ? "text-green-400" :
                                                    health.status === "unhealthy" ? "text-amber-400" : "text-red-400"
                                                    }`}>
                                                    {health.status === "healthy" ? <CheckCircle className="w-3.5 h-3.5" /> :
                                                        health.status === "unhealthy" ? <AlertTriangle className="w-3.5 h-3.5" /> :
                                                            <XCircle className="w-3.5 h-3.5" />}
                                                    {health.latency ? `${health.latency}ms` : health.status}
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => testConnection(engine.id, engine.baseUrl, engine.type)}
                                                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-400 transition-colors"
                                                >
                                                    <Wifi className="w-3.5 h-3.5" /> Test
                                                </button>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => testConnection(engine.id, engine.baseUrl, engine.type)}
                                                    className="p-1.5 rounded-lg hover:bg-blue-500/10 text-gray-500 hover:text-blue-400 transition-all"
                                                    title="Test connection"
                                                >
                                                    <Activity className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => startTransition(() => toggleEngineStatus(engine.id, !engine.isActive))}
                                                    className={`p-1.5 rounded-lg transition-all ${engine.isActive
                                                        ? 'hover:bg-amber-500/10 text-gray-500 hover:text-amber-400'
                                                        : 'hover:bg-green-500/10 text-gray-500 hover:text-green-400'
                                                        }`}
                                                    title={engine.isActive ? "Deactivate" : "Activate"}
                                                >
                                                    {engine.isActive ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                                                </button>
                                                {deleteConfirmId === engine.id ? (
                                                    <div className="flex items-center gap-1 ml-1">
                                                        <button
                                                            onClick={() => handleDelete(engine.id)}
                                                            className="text-[10px] px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                                                            disabled={isPending}
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirmId(null)}
                                                            className="text-[10px] px-2 py-1 text-gray-500 hover:text-gray-300 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirmId(engine.id)}
                                                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all"
                                                        title="Delete engine"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
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
