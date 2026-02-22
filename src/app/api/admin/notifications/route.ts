import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redis } from "@/lib/redis"

export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        // Ensure only admins can access these notifications
        if (!session || session.user?.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Fetch top 50 notifications from the "admin:notifications" list
        const rawNotifications = await redis.lrange("admin:notifications", 0, 49)

        // Parse the JSON strings back into objects
        const notifications = rawNotifications.map(n => {
            try {
                return JSON.parse(n)
            } catch {
                return null
            }
        }).filter(Boolean)

        return NextResponse.json(notifications)
    } catch (error) {
        console.error("Failed to fetch admin notifications:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
