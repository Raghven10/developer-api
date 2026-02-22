import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redis } from "@/lib/redis"

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user?.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const resolvedParams = await params;
        const notificationId = resolvedParams.id
        if (!notificationId) {
            return new NextResponse("Bad Request", { status: 400 })
        }

        // We must fetch all notifications, find the one with the matching ID, and remove it
        const rawNotifications = await redis.lrange("admin:notifications", 0, -1)

        let targetPayload: string | null = null
        for (const n of rawNotifications) {
            try {
                const parsed = JSON.parse(n)
                if (parsed.id === notificationId) {
                    targetPayload = n
                    break
                }
            } catch {
                continue
            }
        }

        if (targetPayload) {
            // Remove exactly 1 occurrence of this specific payload string
            await redis.lrem("admin:notifications", 1, targetPayload)
            return new NextResponse("Deleted", { status: 200 })
        }

        return new NextResponse("Not Found", { status: 404 })

    } catch (error) {
        console.error("Failed to dismiss admin notification:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
