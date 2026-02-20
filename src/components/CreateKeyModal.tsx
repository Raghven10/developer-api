"use client"

import { useState } from "react"
import { X } from "lucide-react"

interface CreateKeyModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (name: string) => void
    isPending: boolean
}

export function CreateKeyModal({ isOpen, onClose, onSubmit, isPending }: CreateKeyModalProps) {
    const [name, setName] = useState("")

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (name.trim().length === 0) return
        onSubmit(name.trim())
        setName("")
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
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
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-white">Create API Key</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="keyName" className="block text-sm font-medium text-gray-300 mb-2">
                            Display Name
                        </label>
                        <input
                            id="keyName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value.slice(0, 50))}
                            placeholder="e.g. Production API Key"
                            required
                            autoFocus
                            className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all focus:ring-2 focus:ring-indigo-500/50"
                            style={{
                                background: 'rgba(30, 41, 59, 0.8)',
                                border: '1px solid rgba(148, 163, 184, 0.15)',
                            }}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            A display name for the key. Maximum 50 characters.
                        </p>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="mr-3 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || name.trim().length === 0}
                            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                            }}
                        >
                            {isPending ? (
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25" />
                                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                                    </svg>
                                    Creating...
                                </span>
                            ) : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
