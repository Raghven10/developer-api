"use client"

import { useState, useTransition } from "react"
import { createApiKey, revokeApiKey } from "@/lib/actions"
import { Copy, Plus, Trash2, Check, Key } from "lucide-react"
import { CreateKeyModal } from "./CreateKeyModal"

type ApiKey = {
    id: string
    name: string | null
    createdAt: Date
    lastUsed: Date | null
    active: boolean
    key: string
}

export function ApiKeyManager({ appId, initialKeys }: { appId: string, initialKeys: ApiKey[] }) {
    const [showModal, setShowModal] = useState(false)
    const [newKey, setNewKey] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [isPending, startTransition] = useTransition()

    const maskKey = (key: string) => {
        if (key.length <= 12) return key
        return key.substring(0, 7) + "..." + key.substring(key.length - 4)
    }

    const handleCreate = (name: string) => {
        startTransition(async () => {
            try {
                const result = await createApiKey(appId, name)
                setNewKey(result.key)
                setShowModal(false)
            } catch {
                alert("Failed to create key")
            }
        })
    }

    const handleRevoke = (keyId: string) => {
        if (!confirm("Are you sure you want to delete this key? This action cannot be undone.")) return
        startTransition(async () => {
            await revokeApiKey(keyId, appId)
        })
    }

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold mb-1">API Keys</h3>
                    <p className="text-sm text-gray-400">
                        Manage your project API keys. Keep your API keys safe to prevent unauthorized access.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-outline text-sm shrink-0 group hover:border-indigo-500/50 hover:text-indigo-400"
                >
                    <Plus className="w-4 h-4 group-hover:text-indigo-400" /> Create API Key
                </button>
            </div>

            {/* Newly Created Key Banner */}
            {newKey && (
                <div
                    className="p-5 rounded-xl"
                    style={{
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(34, 197, 94, 0.03))',
                        border: '1px solid rgba(34, 197, 94, 0.25)',
                    }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Key className="w-4 h-4 text-green-400" />
                        <h4 className="font-bold text-green-400">Key created successfully!</h4>
                    </div>
                    <p className="text-sm text-gray-300 mb-4">
                        Please save this secret key somewhere safe. You won&apos;t be able to see it again.
                    </p>
                    <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                        <code className="flex-1 font-mono text-sm text-green-300 break-all select-all">{newKey}</code>
                        <button
                            onClick={() => copyToClipboard(newKey)}
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors shrink-0"
                            title="Copy to clipboard"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                        </button>
                    </div>
                    <button
                        onClick={() => setNewKey(null)}
                        className="mt-4 text-xs text-green-400 hover:text-green-300 hover:underline transition-colors"
                    >
                        Done, I&apos;ve saved it
                    </button>
                </div>
            )}

            {/* Keys Table */}
            {initialKeys.length === 0 ? (
                <div className="text-center py-16 rounded-xl" style={{ border: '1px dashed rgba(148, 163, 184, 0.15)' }}>
                    <Key className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium mb-1">No API keys yet</p>
                    <p className="text-sm text-gray-500">Create your first API key to get started.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ background: 'rgba(30, 41, 59, 0.5)' }}>
                                <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">Name</th>
                                <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">Secret Key</th>
                                <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">Created</th>
                                <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">Last Used</th>
                                <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">Status</th>
                                <th className="text-right px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-400"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {initialKeys.map((key, i) => (
                                <tr
                                    key={key.id}
                                    className="group transition-colors hover:bg-white/[0.02]"
                                    style={{ borderTop: i > 0 ? '1px solid rgba(148, 163, 184, 0.06)' : undefined }}
                                >
                                    <td className="px-5 py-4 font-medium text-white">
                                        {key.name || "Unnamed Key"}
                                    </td>
                                    <td className="px-5 py-4">
                                        <code className="font-mono text-xs text-gray-400 bg-black/20 px-2 py-1 rounded">
                                            {maskKey(key.key)}
                                        </code>
                                    </td>
                                    <td className="px-5 py-4 text-gray-400">
                                        {new Date(key.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                                    </td>
                                    <td className="px-5 py-4 text-gray-500">
                                        {key.lastUsed
                                            ? new Date(key.lastUsed).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
                                            : "Never"
                                        }
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${key.active
                                            ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                                            : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${key.active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                            {key.active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <button
                                            onClick={() => handleRevoke(key.id)}
                                            disabled={isPending}
                                            className="p-2 rounded-lg text-gray-500 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                            title="Delete key"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            <CreateKeyModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleCreate}
                isPending={isPending}
            />
        </div>
    )
}
