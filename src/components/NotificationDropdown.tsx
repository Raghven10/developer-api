"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Clock, Key, Check, Trash2, CheckCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { approveModelAccess } from "@/lib/actions"

type Notification = {
    id: string
    message: string
    timestamp: string
    metadata?: {
        action: string
        appName?: string
        userEmail?: string
        appId?: string
        keyId?: string
        modelId?: string
        modelName?: string
        userId?: string
    }
    source: string
}

export function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications", { cache: "no-store", next: { revalidate: 0 } })
            if (res.ok) {
                const data = await res.json()
                // Simple state check for new toasts
                setNotifications(prev => {
                    if (prev.length > 0 && data.length > prev.length) {
                        const newNotif = data.find((n: any) => !prev.some(p => p.id === n.id))
                        if (newNotif) {
                            toast.success("New Admin Notification", {
                                description: newNotif.message,
                                duration: 5000
                            })
                        }
                    }
                    return data
                })
            }
        } catch (e) {
            console.error("Failed to fetch notifications", e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 15000) // Poll every 15s
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleDismiss = async (id: string, source: string, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        try {
            const res = await fetch(`/api/notifications/${id}?source=${encodeURIComponent(source)}`, { method: 'DELETE' })
            if (res.ok) {
                setNotifications(prev => prev.filter(n => n.id !== id))
            } else {
                toast.error("Failed to dismiss notification")
            }
        } catch (err) {
            console.error("Failed to dismiss", err)
            toast.error("Failed to dismiss notification")
        }
    }

    const handleApprove = async (notif: Notification, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!notif.metadata?.keyId || !notif.metadata?.modelId || !notif.metadata?.userId || !notif.metadata?.modelName) {
            toast.error("Missing metadata for approval")
            return
        }

        try {
            await approveModelAccess(
                notif.metadata.keyId,
                notif.metadata.modelId,
                notif.metadata.modelName,
                notif.metadata.userId,
                notif.id
            )
            toast.success(`Approved access to ${notif.metadata.modelName}`)
            // Immediately dismiss from the feed upon successful approval
            const res = await fetch(`/api/notifications/${notif.id}?source=${encodeURIComponent(notif.source)}`, { method: 'DELETE' })
            if (res.ok) setNotifications(prev => prev.filter(n => n.id !== notif.id))
        } catch (err) {
            console.error(err)
            toast.error("Failed to approve access")
        }
    }

    const handleRead = async (notif: Notification) => {
        try {
            const res = await fetch(`/api/notifications/${notif.id}?source=${encodeURIComponent(notif.source)}`, { method: 'DELETE' })
            if (res.ok) setNotifications(prev => prev.filter(n => n.id !== notif.id))
        } catch (err) {
            console.error("Failed to mark as read", err)
        }
    }

    const toggleDropdown = () => {
        setIsOpen(!isOpen)
        if (!isOpen) fetchNotifications()
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className={`relative p-2 rounded-lg transition-colors ${isOpen ? 'bg-[var(--surface-hover)] text-white' : 'text-gray-400 hover:text-white hover:bg-[var(--surface-hover)]'}`}
            >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-[var(--surface)]"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl z-50 overflow-hidden" style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-white/[0.02]">
                        <h3 className="font-bold text-sm text-white">Notifications</h3>
                        <span className="text-xs font-semibold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full">{notifications.length}</span>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center text-sm text-gray-500">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-sm text-gray-500 flex flex-col items-center">
                                <Check className="w-8 h-8 mx-auto mb-2 text-emerald-500/50" />
                                All caught up!
                            </div>
                        ) : (
                            <div className="divide-y divide-[var(--border)]">
                                {notifications.map(notif => (
                                    <div key={notif.id} className="block p-4 hover:bg-white/[0.02] transition-colors relative group">
                                        <div className="flex gap-3">
                                            <div className="mt-1 shrink-0">
                                                {notif.metadata?.action?.includes("create") ? (
                                                    <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                                        <Key className="w-3.5 h-3.5" />
                                                    </div>
                                                ) : (
                                                    <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                                                        <Bell className="w-3.5 h-3.5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 pr-6">
                                                <p className="text-sm font-medium text-gray-200 leading-snug mb-1.5">
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center justify-between relative z-20 mt-2">
                                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    {notif.source === "admin:notifications" && notif.metadata?.action === "requestModelAccess" && (
                                                        <button
                                                            onClick={(e) => handleApprove(notif, e)}
                                                            className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors border border-emerald-500/20 shadow-sm"
                                                        >
                                                            <CheckCircle className="w-3.5 h-3.5" />
                                                            Approve
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => handleDismiss(notif.id, notif.source, e)}
                                            className="absolute top-4 right-3 z-30 p-1.5 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all bg-[var(--surface)] border border-[var(--border)] shadow-sm"
                                            title="Dismiss notification"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                        <Link
                                            href={(notif.source === "admin:notifications" && notif.metadata?.action?.includes("create")) ? "/admin/keys" : "/dashboard"}
                                            onClick={() => {
                                                setIsOpen(false);
                                                handleRead(notif);
                                            }}
                                            className="absolute inset-0 z-0"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {notifications.length > 0 && notifications.some(n => n.source === "admin:notifications") && (
                        <div className="p-2 border-t border-[var(--border)] bg-black/20 text-center relative z-10">
                            <Link href="/admin/notifications" onClick={() => setIsOpen(false)} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium p-2 block w-full">
                                View all admin history
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
