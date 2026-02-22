import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
    try {
        // 1. Extract API Key
        const authHeader = req.headers.get("authorization")
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: { message: "Missing or invalid Authorization header", type: "invalid_request_error" } }, { status: 401 })
        }

        const keyString = authHeader.replace("Bearer ", "")

        // 2. Validate Key
        const apiKey = await prisma.apiKey.findUnique({
            where: { key: keyString },
            include: {
                models: {
                    include: { engine: true }
                },
                app: {
                    include: { user: true }
                }
            }
        })

        if (!apiKey) {
            return NextResponse.json({ error: { message: "Invalid API key", type: "invalid_request_error" } }, { status: 401 })
        }

        if (!apiKey.active) {
            return NextResponse.json({ error: { message: "API key is inactive. Please contact support or check your dashboard.", type: "access_denied" } }, { status: 403 })
        }

        // 3. Extract Model from body
        const body = await req.json()
        const modelId = body.model

        if (!modelId) {
            return NextResponse.json({ error: { message: "Model ID is required in the request body", type: "invalid_request_error" } }, { status: 400 })
        }

        // 4. Validate Model Access
        const model = apiKey.models.find(m => m.apiId === modelId)
        if (!model) {
            return NextResponse.json({
                error: {
                    message: `This API key does not have access to model '${modelId}'. Please request access in your dashboard.`,
                    type: "access_denied"
                }
            }, { status: 403 })
        }

        if (!model.isActive) {
            return NextResponse.json({ error: { message: `Model '${modelId}' is currently offline.`, type: "service_unavailable" } }, { status: 503 })
        }

        // 5. Proxy the request
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        }

        // If the engine requires an API key, add it to the Authorization header
        if (model.engine?.apiKey) {
            headers["Authorization"] = `Bearer ${model.engine.apiKey}`
        }

        const response = await fetch(model.endpoint, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        })

        // 6. Update last used in the background (don't await)
        prisma.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsed: new Date() }
        }).catch(console.error)

        // 7. Handle Streaming vs JSON
        if (body.stream) {
            // Return the raw readable stream directly to the client
            const streamHeaders = new Headers(response.headers)
            streamHeaders.set("Content-Type", "text/event-stream")
            streamHeaders.set("Cache-Control", "no-cache")
            streamHeaders.set("Connection", "keep-alive")

            return new NextResponse(response.body, {
                status: response.status,
                headers: streamHeaders
            })
        }

        // Handle standard JSON response
        const data = await response.json()
        return NextResponse.json(data, { status: response.status })

    } catch (error: any) {
        console.error("API Proxy Error:", error)
        return NextResponse.json({
            error: {
                message: "An internal error occurred while processing your request.",
                type: "api_error"
            }
        }, { status: 500 })
    }
}
