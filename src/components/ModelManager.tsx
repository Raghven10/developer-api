"use client"

import { useState, useTransition } from "react"
import { createModel, toggleModelStatus, deleteModel } from "@/lib/actions"
import { Plus, Trash2, Power, PowerOff, Box, X, Loader2 } from "lucide-react"

type Engine = {
    id: string
    name: string
    type: string
    baseUrl: string
}

type Model = {
    id: string
    name: string
    apiId: string
    endpoint: string
    isActive: boolean
    description: string | null
    engineId: string | null
    engine: { name: string; type: string } | null
    createdAt: Date
}

export function ModelManager({ models, engines }: { models: Model[]; engines: Engine[] }) {
    const [showForm, setShowForm] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
    const [selectedEngineId, setSelectedEngineId] = useState<string>("")
    const [error, setError] = useState<string | null>(null)

    // Auto-fill endpoint based on selected engine
    const selectedEngine = engines.find(e => e.id === selectedEngineId)
    const suggestedEndpoint = selectedEngine
        ? `${selectedEngine.baseUrl.replace(/\/$/, "")}${selectedEngine.type === "ollama" ? "/api/generate" : "/v1/chat/completions"}`
        : ""

    function handleDelete(modelId: string) {
        setError(null)
        startTransition(async () => {
            try {
                await deleteModel(modelId)
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
                        <Box className="w-6 h-6 text-indigo-400" />
                        Model Registry
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Expose computational models via secure API endpoints.
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
                    {showForm ? "Cancel" : "Register Model"}
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
                    <Loader2 className="w-5 h-5 shrink-0" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {/* Add Model Form */}
            {showForm && (
                <div className="mb-10 p-6 rounded-3xl border border-white/5 bg-white/[0.03] shadow-2xl">
                    <h3 className="text-sm font-bold text-gray-300 mb-6 flex items-center gap-2">
                        <Box className="w-4 h-4 text-indigo-400" /> New Model Configuration
                    </h3>
                    <form
                        action={(formData) => {
                            startTransition(async () => {
                                try {
                                    await createModel(formData)
                                    setShowForm(false)
                                    setSelectedEngineId("")
                                    setError(null)
                                } catch (e: any) {
                                    setError(e.message)
                                }
                            })
                        }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">Display Template</label>
                            <input name="name" placeholder="e.g. GPT-4o Mini Optimized" className="input" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">Canonical API ID</label>
                            <input name="apiId" placeholder="e.g. gpt-4o-mini" className="input" required />
                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">Required for API request dispatching</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">Compute Host <span className="text-gray-700 font-normal normal-case">(optional)</span></label>
                            <select
                                name="engineId"
                                className="input"
                                value={selectedEngineId}
                                onChange={(e) => setSelectedEngineId(e.target.value)}
                            >
                                <option value="">Direct Proxy (No Engine)</option>
                                {engines.map(e => (
                                    <option key={e.id} value={e.id}>
                                        {e.name} — {e.type.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">Internal Gateway URL</label>
                            <input
                                name="endpoint"
                                placeholder="http://gateway.internal:8080/v1"
                                className="input"
                                defaultValue={suggestedEndpoint}
                                key={suggestedEndpoint}
                                required
                            />
                            {selectedEngine && (
                                <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-tighter italic">Protocol inherited from {selectedEngine.name}</p>
                            )}
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">Model Metadata <span className="text-gray-700 font-normal normal-case">(optional)</span></label>
                            <input name="description" placeholder="Technical specifications or deployment notes..." className="input" />
                        </div>
                        <div className="md:col-span-2 flex justify-end pt-2">
                            <button type="submit" className="px-8 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-200 transition-all flex items-center gap-2 shadow-xl shadow-white/5" disabled={isPending}>
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Finalize Registration</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Models Table */}
            {models.length === 0 ? (
                <div className="text-center py-16 rounded-3xl bg-white/[0.01] border border-dashed border-white/10">
                    <Box className="w-12 h-12 mx-auto mb-4 text-gray-600 opacity-50" />
                    <p className="text-sm font-bold text-gray-400">Registry is currently empty.</p>
                    <p className="text-xs text-gray-600 mt-1">Populate the system with models to enable API access.</p>
                </div>
            ) : (
                <div className="overflow-x-auto -mx-6 px-6 pb-4 custom-scrollbar">
                    <table className="w-full text-sm border-spacing-y-2 border-separate">
                        <thead>
                            <tr className="text-gray-500">
                                <th className="text-left text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6">Model Template</th>
                                <th className="text-left text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6 text-center">Protocol ID</th>
                                <th className="text-left text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6">Host Engine</th>
                                <th className="text-left text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6">Gateway Alias</th>
                                <th className="text-left text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6">Lifecycle</th>
                                <th className="text-right text-[10px] font-black uppercase tracking-[0.2em] py-4 px-6">Operations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {models.map((model) => (
                                <tr key={model.id} className="group transition-all duration-300">
                                    <td className="py-4 px-6 bg-white/[0.02] group-hover:bg-white/[0.04] rounded-l-2xl border-y border-l border-white/5 group-hover:border-indigo-500/20 transition-all">
                                        <div className="font-bold text-white group-hover:text-indigo-400 transition-colors">{model.name}</div>
                                        {model.description && (
                                            <div className="text-[10px] text-gray-500 mt-1 font-medium">{model.description}</div>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 bg-white/[0.02] group-hover:bg-white/[0.04] border-y border-white/5 group-hover:border-indigo-500/20 transition-all text-center">
                                        <code className="text-[10px] font-black text-indigo-400 bg-indigo-500/5 px-2.5 py-1.5 rounded-lg border border-indigo-500/10 active:scale-95 transition-transform cursor-pointer">
                                            {model.apiId}
                                        </code>
                                    </td>
                                    <td className="py-4 px-6 bg-white/[0.02] group-hover:bg-white/[0.04] border-y border-white/5 group-hover:border-indigo-500/20 transition-all">
                                        {model.engine ? (
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-300">{model.engine.name}</span>
                                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">{model.engine.type} NODE</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-black text-gray-600 uppercase italic">Standalone</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 bg-white/[0.02] group-hover:bg-white/[0.04] border-y border-white/5 group-hover:border-indigo-500/20 transition-all">
                                        <code className="text-[10px] text-gray-500 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 max-w-[160px] truncate block font-mono">
                                            {model.endpoint}
                                        </code>
                                    </td>
                                    <td className="py-4 px-6 bg-white/[0.02] group-hover:bg-white/[0.04] border-y border-white/5 group-hover:border-indigo-500/20 transition-all">
                                        <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${model.isActive
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${model.isActive ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-red-400'}`} />
                                            {model.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 bg-white/[0.02] group-hover:bg-white/[0.04] rounded-r-2xl border-y border-r border-white/5 group-hover:border-indigo-500/20 transition-all text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => startTransition(() => toggleModelStatus(model.id, !model.isActive))}
                                                className={`p-2 rounded-xl transition-all border border-transparent ${model.isActive
                                                    ? 'bg-white/5 hover:bg-amber-500/20 text-gray-500 hover:text-amber-400 hover:border-amber-500/20'
                                                    : 'bg-white/5 hover:bg-emerald-500/20 text-gray-500 hover:text-emerald-400 hover:border-emerald-500/20'
                                                    }`}
                                                title={model.isActive ? "Override Deactivate" : "Initialize Activation"}
                                            >
                                                {model.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                            </button>
                                            {deleteConfirmId === model.id ? (
                                                <div className="flex items-center gap-2 ml-2">
                                                    <button
                                                        onClick={() => handleDelete(model.id)}
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
                                                    onClick={() => setDeleteConfirmId(model.id)}
                                                    className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
                                                    title="Decommission model"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
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

