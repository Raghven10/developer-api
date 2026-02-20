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
        <div className="card">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Box className="w-5 h-5 text-[var(--primary)]" />
                        Models
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Models available to developers through the API.
                    </p>
                </div>
                <button
                    onClick={() => { setShowForm(!showForm); setError(null) }}
                    className="btn btn-outline text-sm flex items-center gap-2"
                >
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? "Cancel" : "Add Model"}
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Add Model Form */}
            {showForm && (
                <div className="mb-6 p-5 rounded-xl border border-[var(--border)]" style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
                    <h3 className="text-sm font-bold text-gray-300 mb-4">Register New Model</h3>
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
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-500 block mb-1">Display Name</label>
                            <input name="name" placeholder="e.g. Llama 3 70B" className="input" required />
                        </div>
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-500 block mb-1">API ID</label>
                            <input name="apiId" placeholder="e.g. llama-3-70b-instruct" className="input" required />
                            <p className="text-[10px] text-gray-600 mt-1">Used in API requests as the model identifier</p>
                        </div>
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-500 block mb-1">Inference Engine <span className="text-gray-600 normal-case">(optional)</span></label>
                            <select
                                name="engineId"
                                className="input"
                                value={selectedEngineId}
                                onChange={(e) => setSelectedEngineId(e.target.value)}
                            >
                                <option value="">No engine (manual endpoint)</option>
                                {engines.map(e => (
                                    <option key={e.id} value={e.id}>
                                        {e.name} ({e.type})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-500 block mb-1">Endpoint URL</label>
                            <input
                                name="endpoint"
                                placeholder="http://localhost:11434/api/generate"
                                className="input"
                                defaultValue={suggestedEndpoint}
                                key={suggestedEndpoint} // reset when engine changes
                                required
                            />
                            {selectedEngine && (
                                <p className="text-[10px] text-blue-400/70 mt-1">Auto-filled from {selectedEngine.name}</p>
                            )}
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs uppercase font-bold text-gray-500 block mb-1">Description <span className="text-gray-600 normal-case">(optional)</span></label>
                            <input name="description" placeholder="Model description" className="input" />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button type="submit" className="btn btn-primary" disabled={isPending}>
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Model"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Models Table */}
            {models.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Box className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No models registered yet.</p>
                    <p className="text-xs mt-1">Click "Add Model" to register your first model.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 py-3 px-4">Model</th>
                                <th className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 py-3 px-4">API ID</th>
                                <th className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 py-3 px-4">Engine</th>
                                <th className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 py-3 px-4">Endpoint</th>
                                <th className="text-left text-xs font-bold uppercase tracking-wider text-gray-500 py-3 px-4">Status</th>
                                <th className="text-right text-xs font-bold uppercase tracking-wider text-gray-500 py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {models.map((model) => (
                                <tr key={model.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-white">{model.name}</div>
                                        {model.description && (
                                            <div className="text-xs text-gray-500 mt-0.5">{model.description}</div>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <code className="text-xs text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded">{model.apiId}</code>
                                    </td>
                                    <td className="py-3 px-4">
                                        {model.engine ? (
                                            <span className="text-xs text-gray-300">
                                                {model.engine.name}
                                                <span className="text-gray-600 ml-1">({model.engine.type})</span>
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-600">—</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <code className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded max-w-[200px] truncate block">{model.endpoint}</code>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${model.isActive
                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${model.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                                            {model.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => startTransition(() => toggleModelStatus(model.id, !model.isActive))}
                                                className={`p-1.5 rounded-lg transition-all ${model.isActive
                                                    ? 'hover:bg-amber-500/10 text-gray-500 hover:text-amber-400'
                                                    : 'hover:bg-green-500/10 text-gray-500 hover:text-green-400'
                                                    }`}
                                                title={model.isActive ? "Deactivate" : "Activate"}
                                            >
                                                {model.isActive ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                                            </button>
                                            {deleteConfirmId === model.id ? (
                                                <div className="flex items-center gap-1 ml-1">
                                                    <button
                                                        onClick={() => handleDelete(model.id)}
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
                                                    onClick={() => setDeleteConfirmId(model.id)}
                                                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all"
                                                    title="Delete model"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
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
