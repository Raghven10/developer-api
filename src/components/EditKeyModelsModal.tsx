"use client"

import { useState, useTransition } from "react"
import { X, Settings2, Loader2 } from "lucide-react"
import { updateApiKeyModelsAdmin } from "@/lib/actions"

interface EditKeyModelsModalProps {
    keyId: string
    keyName: string
    initialModelIds: string[]
    publicModels: { id: string, name: string }[]
}

export function EditKeyModelsModal({ keyId, keyName, initialModelIds, publicModels }: EditKeyModelsModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set(initialModelIds))

    const handleOpen = () => {
        setSelectedModels(new Set(initialModelIds))
        setIsOpen(true)
    }

    const handleClose = () => {
        if (isPending) return
        setIsOpen(false)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        startTransition(async () => {
            try {
                await updateApiKeyModelsAdmin(keyId, Array.from(selectedModels))
                setIsOpen(false)
            } catch (err) {
                alert("Failed to update models")
            }
        })
    }

    return (
        <>
            <button
                onClick={handleOpen}
                className="text-xs font-medium px-3 py-1.5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all flex items-center gap-1.5"
                title="Edit Allowed Models"
            >
                <Settings2 className="w-3.5 h-3.5" />
                Models
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <div
                        className="relative w-full max-w-lg mx-4 rounded-2xl p-8 animate-in"
                        style={{
                            background: 'rgba(15, 23, 42, 0.95)',
                            border: '1px solid rgba(148, 163, 184, 0.15)',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 80px rgba(99, 102, 241, 0.08)',
                        }}
                    >
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            disabled={isPending}
                            className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-2xl font-bold mb-2 text-white">Edit Models</h2>
                        <p className="text-sm text-gray-400 mb-6">Change allowed models for <strong>{keyName || "Unnamed Key"}</strong></p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                {publicModels.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic px-1">No active models found in the system.</p>
                                ) : (
                                    <div className="max-h-60 overflow-y-auto pr-2 pb-2 grid grid-cols-1 sm:grid-cols-2 gap-3 custom-scrollbar">
                                        {publicModels.map(model => (
                                            <label key={model.id} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-slate-800/80 cursor-pointer hover:bg-slate-700/80 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    disabled={isPending}
                                                    checked={selectedModels.has(model.id)}
                                                    onChange={(e) => {
                                                        const newSet = new Set(selectedModels)
                                                        if (e.target.checked) newSet.add(model.id)
                                                        else newSet.delete(model.id)
                                                        setSelectedModels(newSet)
                                                    }}
                                                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500/50"
                                                />
                                                <span className="text-sm font-medium text-gray-300 truncate" title={model.name}>{model.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end pt-2 text-left">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={isPending}
                                    className="mr-3 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                                    style={{
                                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                        boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                                    }}
                                >
                                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
