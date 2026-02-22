"use client"

import { useEffect, useState } from "react"
import { Bell, Clock, Key, CheckCircle, ExternalLink, Activity, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { approveModelAccess } from "@/lib/actions"

type Notification = {
    id: string
    message: string
    timestamp: string
    metadata?: {
        action: string
        appName: string
        userEmail: string
        keyId: string
        modelId?: string
        modelName?: string
        userId?: string
    }
    source: string
}

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch("/api/notifications", { cache: "no-store", next: { revalidate: 0 } })
                if (!res.ok) throw new Error("Failed to fetch notifications")
                const data = await res.json()
                const adminOnly = data.filter((n: Notification) => n.source === "admin:notifications")
                setNotifications(adminOnly)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchNotifications()
    }, [])

    const handleApprove = async (notif: Notification) => {
        if (!notif.metadata?.keyId || !notif.metadata?.modelId || !notif.metadata?.userId || !notif.metadata?.modelName) {
            toast.error("Missing metadata for approval")
            return
        }

        const prom = approveModelAccess(
            notif.metadata.keyId,
            notif.metadata.modelId,
            notif.metadata.modelName,
            notif.metadata.userId,
            notif.id
        ).then(async () => {
            await fetch(`/api/notifications/${notif.id}?source=${encodeURIComponent(notif.source)}`, { method: 'DELETE' })
            setNotifications(prev => prev.filter(n => n.id !== notif.id))
        })

        toast.promise(prom, {
            loading: `Approving access to '${notif.metadata.modelName}'...`,
            success: `Approved access to ${notif.metadata.modelName}`,
            error: "Failed to approve access."
        })
    }

    const handleRead = async (notif: Notification) => {
        try {
            const res = await fetch(`/api/notifications/${notif.id}?source=${encodeURIComponent(notif.source)}`, { method: 'DELETE' })
            if (res.ok) setNotifications(prev => prev.filter(n => n.id !== notif.id))
        } catch (err) {
            console.error("Failed to dismiss", err)
        }
    }

    return (
        <div className="w-full max-w-[1000px] mx-auto px-4">
            <div className="mb-12">
                <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Bell className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-1">
                            System Alerts
                        </h1>
                        <div className="flex items-center gap-2 text-indigo-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                            <Activity className="w-3 h-3" /> Event Log & Actions
                        </div>
                    </div>
                </div>
                <p className="text-gray-400 max-w-2xl mt-4">
                    Monitor real-time system events, manage credential approvals, and orchestration requests from the developer ecosystem.
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-20 text-gray-500">
                    <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-4" />
                    Loading notifications...
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-20 rounded-2xl" style={{ border: '1px dashed rgba(148, 163, 184, 0.15)' }}>
                    <CheckCircle className="w-12 h-12 text-emerald-500/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-1">All caught up!</h3>
                    <p className="text-gray-400">No new notifications from the system.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 p-6"
                        >
                            {/* Accent Glow */}
                            <div className={`absolute top-0 left-0 w-1 h-full transition-all duration-300 ${notif.metadata?.action.includes("create") ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                                }`} />

                            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                <div className="flex gap-5">
                                    <div className="shrink-0">
                                        {notif.metadata?.action.includes("create") ? (
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                                <Key className="w-6 h-6" />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                                <Bell className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-lg tracking-tight mb-2 group-hover:text-indigo-300 transition-colors">
                                            {notif.message}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-3">
                                            {notif.metadata?.userEmail && (
                                                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 text-gray-400">
                                                    Origin: <span className="text-gray-200">{notif.metadata.userEmail}</span>
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(notif.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                    {notif.metadata?.action === "requestModelAccess" && (
                                        <button
                                            onClick={() => handleApprove(notif)}
                                            className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-black uppercase tracking-[0.15em] hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Grant Approval
                                        </button>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href="/admin/keys"
                                            onClick={() => handleRead(notif)}
                                            className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 transition-all"
                                            title="Inspect related credentials"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleRead(notif)}
                                            className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                                            title="Clear notification"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
