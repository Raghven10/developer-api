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
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Admin Notifications
                    </h1>
                </div>
                <p className="text-gray-400 text-sm">Review recent activity and pending approvals.</p>
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
                            className="card p-5 border-l-4 hover:bg-white/[0.02] transition-colors"
                            style={{ borderLeftColor: notif.metadata?.action.includes("create") ? '#10b981' : '#6366f1' }}
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex gap-4">
                                    <div className="mt-1">
                                        {notif.metadata?.action.includes("create") ? (
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                                <Key className="w-4 h-4" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                                <Bell className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white text-lg mb-1">{notif.message}</p>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
                                            {notif.metadata?.userEmail && (
                                                <span className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded">
                                                    Requested by: <span className="text-gray-200">{notif.metadata.userEmail}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3 justify-end">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(notif.timestamp).toLocaleString()}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {notif.metadata?.action === "requestModelAccess" && (
                                            <button
                                                onClick={() => handleApprove(notif)}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg border border-emerald-500/20 transition-colors uppercase tracking-wider shadow-sm"
                                            >
                                                <Activity className="w-3.5 h-3.5" />
                                                Approve Model Request
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleRead(notif)}
                                            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                            title="Dismiss notification"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Dismiss
                                        </button>
                                        <Link
                                            href="/admin/keys"
                                            onClick={() => handleRead(notif)}
                                            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors"
                                        >
                                            Review Keys <ExternalLink className="w-3.5 h-3.5" />
                                        </Link>
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
