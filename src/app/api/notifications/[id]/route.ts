import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redis } from "@/lib/redis"

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const resolvedParams = await params
        const notificationId = resolvedParams.id
        const { searchParams } = new URL(req.url)
        const source = searchParams.get('source')

        if (!notificationId || !source) {
            return new NextResponse("Bad Request", { status: 400 })
        }

        // Verify that the user has the right to delete from this source
        if (source === "admin:notifications" && session.user.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (source.startsWith("user:notifications:") && source !== `user:notifications:${session.user.id}`) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const rawNotifications = await redis.lrange(source, 0, -1)

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
            await redis.lrem(source, 1, targetPayload)
            return new NextResponse("Deleted", { status: 200 })
        }

        return new NextResponse("Not Found", { status: 404 })

    } catch (error) {
        console.error("Failed to dismiss notification:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
