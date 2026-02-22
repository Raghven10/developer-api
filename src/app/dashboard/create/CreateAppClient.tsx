
"use client"

import { useState, useTransition } from "react"
import { createApp } from "@/lib/actions"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Check, Copy, Key, Loader2, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CreateAppClient({ publicModels }: { publicModels: any[] }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set(publicModels.map(m => m.id)))

    const [createdApp, setCreatedApp] = useState<{
        appId: string;
        appName: string;
        apiKey: string;
    } | null>(null)
    const [copied, setCopied] = useState(false)

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSubmit = (formData: FormData) => {
        setError(null)
        startTransition(async () => {
            try {
                const result = await createApp(formData)
                setCreatedApp(result)
            } catch (e: any) {
                setError(e.message)
            }
        })
    }

    if (createdApp) {
        return (
            <div className="container max-w-lg py-20">
                <div className="card text-center mb-8">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-green-500/20">
                        <Check className="w-8 h-8 text-green-400" />
                    </div>

                    <h1 className="text-2xl font-bold mb-2">Application Created!</h1>
                    <p className="text-gray-400 mb-8">
                        Your app <strong className="text-white">{createdApp.appName}</strong> is ready to use. We have generated your first API key for you.
                    </p>

                    <div
                        className="p-6 rounded-xl text-left"
                        style={{
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(34, 197, 94, 0.03))',
                            border: '1px solid rgba(34, 197, 94, 0.25)',
                        }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Key className="w-5 h-5 text-green-400" />
                            <h4 className="font-bold text-green-400">Default API Key</h4>
                        </div>
                        <p className="text-sm text-gray-300 mb-6">
                            Please save this secret key somewhere safe. You won&apos;t be able to see it again!
                        </p>
                        <div className="flex items-center gap-2 p-4 rounded-lg" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                            <code className="flex-1 font-mono text-base text-green-300 break-all select-all">{createdApp.apiKey}</code>
                            <button
                                onClick={() => copyToClipboard(createdApp.apiKey)}
                                className="p-2.5 rounded-lg hover:bg-white/5 transition-colors shrink-0"
                                title="Copy to clipboard"
                            >
                                {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-gray-400" />}
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-4">
                        <Link href="/dashboard" className="btn btn-outline flex-1 justify-center">
                            Go to App Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container max-w-lg py-20">
            <Link href="/dashboard" className="flex items-center text-sm text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to dashboard
            </Link>

            <div className="card">
                <h1 className="text-2xl font-bold mb-6">Create New Application</h1>

                {error && (
                    <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
                            Application Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            placeholder="e.g. My Awesome Startup"
                            required
                            className="input bg-[var(--surface-hover)]"
                            disabled={isPending}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Allowed Models for Default API Key
                        </label>
                        {publicModels.length === 0 ? (
                            <p className="text-sm text-gray-500 italic px-1">No active models found.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {publicModels.map(model => (
                                    <label key={model.id} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-hover)] cursor-pointer hover:bg-white/5 transition-colors">
                                        <input
                                            type="checkbox"
                                            name="modelIds"
                                            value={model.id}
                                            checked={selectedModels.has(model.id)}
                                            onChange={(e) => {
                                                const newSet = new Set(selectedModels)
                                                if (e.target.checked) newSet.add(model.id)
                                                else newSet.delete(model.id)
                                                setSelectedModels(newSet)
                                            }}
                                            className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500/50"
                                            disabled={isPending}
                                        />
                                        <span className="text-sm font-medium text-gray-300">{model.name}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary w-full justify-center" disabled={isPending}>
                        {isPending ? (
                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating...</>
                        ) : (
                            <><Plus className="w-5 h-5 mr-2" /> Create Application</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
