import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { baseUrl, type } = await request.json()

    if (!baseUrl) {
        return NextResponse.json({ error: "baseUrl is required" }, { status: 400 })
    }

    try {
        const start = Date.now()

        // Determine the health endpoint based on engine type
        let healthUrl: string
        switch (type) {
            case "ollama":
                healthUrl = `${baseUrl.replace(/\/$/, "")}/api/tags`
                break
            case "vllm":
            case "sglang":
            case "openai":
                healthUrl = `${baseUrl.replace(/\/$/, "")}/v1/models`
                break
            default:
                healthUrl = `${baseUrl.replace(/\/$/, "")}/health`
        }

        const response = await fetch(healthUrl, {
            method: "GET",
            signal: AbortSignal.timeout(8000),
        })

        const latency = Date.now() - start

        if (response.ok) {
            let models: string[] = []
            try {
                const data = await response.json()
                // Extract model names based on engine type
                if (type === "ollama" && data.models) {
                    models = data.models.map((m: any) => m.name || m.model)
                } else if (data.data) {
                    // OpenAI-compatible format
                    models = data.data.map((m: any) => m.id)
                }
            } catch {
                // Response might not be JSON, that's ok
            }

            return NextResponse.json({
                status: "healthy",
                latency,
                models,
                message: `Connected successfully (${latency}ms)`
            })
        } else {
            return NextResponse.json({
                status: "unhealthy",
                latency,
                models: [],
                message: `Server responded with ${response.status}`
            })
        }
    } catch (error: any) {
        return NextResponse.json({
            status: "unreachable",
            latency: null,
            models: [],
            message: error.message?.includes("timeout")
                ? "Connection timed out (8s)"
                : `Connection failed: ${error.message}`
        })
    }
}
