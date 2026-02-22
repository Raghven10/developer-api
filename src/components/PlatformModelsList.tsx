"use client"

import { useState, useTransition } from "react"
import { requestModelAccess } from "@/lib/actions"
import { CheckCircle, Lock, ShieldAlert } from "lucide-react"
import { toast } from "sonner"

export function PlatformModelsList({ app, publicModels }: { app: any, publicModels: any[] }) {
    const [selectedKeyId, setSelectedKeyId] = useState<string>(app.apiKeys[0]?.id || "")
    const [isPending, startTransition] = useTransition()
    const [requestedModels, setRequestedModels] = useState<Record<string, boolean>>({})

    const handleRequest = (modelId: string, modelName: string) => {
        if (!selectedKeyId) return

        const reqPromise = requestModelAccess(app.id, selectedKeyId, modelId, modelName).then(() => {
            setRequestedModels(prev => ({ ...prev, [modelId]: true }))
        })

        toast.promise(reqPromise, {
            loading: `Sending request for '${modelName}'...`,
            success: `Request sent to admin for approval.`,
            error: "Failed to submit request. Please try again."
        })
    }

    const selectedKey = app.apiKeys.find((k: any) => k.id === selectedKeyId)
    const boundModelIds = selectedKey ? selectedKey.models.map((m: any) => m.id) : []

    return (
        <div className="card mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h3 className="text-xl font-bold mb-1">Platform Public Models</h3>
                    <p className="text-gray-400 text-sm">Manage model access for your API Keys.</p>
                </div>
                {app.apiKeys.length > 0 && (
                    <select
                        value={selectedKeyId}
                        onChange={e => setSelectedKeyId(e.target.value)}
                        className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                        {app.apiKeys.map((k: any) => (
                            <option key={k.id} value={k.id}>
                                {k.name || "Unnamed Key"} ({k.key.substring(0, 7)}...)
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {publicModels.length === 0 ? (
                    <p className="text-sm text-gray-500">No public models found.</p>
                ) : (
                    publicModels.map(model => {
                        const hasAccess = boundModelIds.includes(model.id)
                        const isRequested = requestedModels[model.id]

                        return (
                            <div key={model.id} className="p-4 bg-[var(--surface-hover)] rounded-xl border border-[var(--border)] flex items-center justify-between transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${hasAccess ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-500'}`}>
                                        {hasAccess ? <CheckCircle className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                    </div>
                                    <span className={`font-medium ${hasAccess ? 'text-white' : 'text-gray-400'}`}>{model.name}</span>
                                </div>

                                <div>
                                    {hasAccess ? (
                                        <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">Active</span>
                                    ) : isRequested ? (
                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/20">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                            Pending Approval
                                        </span>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-500 font-medium">No Access</span>
                                            <button
                                                onClick={() => handleRequest(model.id, model.name)}
                                                disabled={isPending || !selectedKeyId}
                                                className="text-xs font-semibold bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
                                            >
                                                Request
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
