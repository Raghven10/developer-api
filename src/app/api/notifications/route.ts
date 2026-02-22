import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redis } from "@/lib/redis"

export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const userKey = `user:notifications:${session.user.id}`
        const rawUserNotifications = await redis.lrange(userKey, 0, 99)
        const userNotifications = rawUserNotifications.reduce((acc, n) => {
            try {
                if (n && typeof n === 'string') {
                    const parsed = JSON.parse(n)
                    parsed.source = userKey
                    acc.push(parsed)
                }
            } catch (e) {
                console.warn("Failed to parse user notification:", e)
            }
            return acc
        }, [] as any[])

        let adminNotifications: any[] = []
        if (session.user.role === "admin") {
            const rawAdminNotifications = await redis.lrange("admin:notifications", 0, 99)
            adminNotifications = rawAdminNotifications.reduce((acc, n) => {
                try {
                    if (n && typeof n === 'string') {
                        const parsed = JSON.parse(n)
                        parsed.source = "admin:notifications"
                        acc.push(parsed)
                    }
                } catch (e) {
                    console.warn("Failed to parse admin notification:", e)
                }
                return acc
            }, [] as any[])
        }

        // Combine and sort by timestamp descending
        const allNotifications = [...userNotifications, ...adminNotifications].sort((a, b) => {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        })

        return NextResponse.json(allNotifications)
    } catch (error: any) {
        console.error("Failed to fetch notifications:", error?.message || error)
        return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
