"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { randomBytes } from "crypto"
import { notifyAdmin, notifyUser } from "@/lib/redis"

export async function getPublicModels() {
    return await prisma.model.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
    });
}

export async function createApp(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
        throw new Error("Unauthorized")
    }

    const name = formData.get("name") as string
    if (!name || name.trim().length === 0) {
        throw new Error("Name is required")
    }

    const modelIds = formData.getAll("modelIds") as string[]

    const app = await prisma.app.create({
        data: {
            name,
            userId: session.user.id
        }
    })

    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    const keyString = "sk-" + randomBytes(24).toString("hex")

    const newKey = await prisma.apiKey.create({
        data: {
            key: keyString,
            name: "Default Key",
            appId: app.id,
            active: false,
            expiresAt,
            models: {
                connect: modelIds.map(id => ({ id }))
            }
        }
    })

    // Notify administrators
    await notifyAdmin(`New Default API Key requested for App: ${app.name}`, {
        appId: app.id,
        appName: app.name,
        userEmail: session.user.email,
        keyId: newKey.id,
        action: "createApp"
    })

    revalidatePath("/dashboard")

    // Return both the app info and the plain key so the UI can display it
    return {
        appId: app.id,
        appName: app.name,
        apiKey: newKey.key
    }
}

export async function createApiKey(appId: string, name: string, modelIds: string[] = []) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
        throw new Error("Unauthorized")
    }

    // Verify ownership
    const app = await prisma.app.findUnique({
        where: { id: appId }
    })

    if (!app || app.userId !== session.user.id) {
        throw new Error("Unauthorized access to app")
    }

    const key = "sk-" + randomBytes(24).toString("hex")
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)

    const newKey = await prisma.apiKey.create({
        data: {
            key,
            name,
            appId,
            active: false,
            expiresAt,
            models: {
                connect: modelIds.map(id => ({ id }))
            }
        }
    })

    // Notify administrators
    await notifyAdmin(`New API Key '${name}' requested for App: ${app.name}`, {
        appId: app.id,
        appName: app.name,
        userEmail: session.user.email,
        keyId: newKey.id,
        keyName: name,
        action: "createApiKey"
    })

    revalidatePath(`/dashboard/${appId}`)
    return { key: newKey.key, id: newKey.id, name: newKey.name }
}

export async function revokeApiKey(keyId: string, appId: string) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
        throw new Error("Unauthorized")
    }

    // Verify ownership via app
    const key = await prisma.apiKey.findUnique({
        where: { id: keyId },
        include: { app: true }
    })

    if (!key || key.app.userId !== session.user.id) {
        throw new Error("Unauthorized")
    }

    await prisma.apiKey.delete({
        where: { id: keyId }
    })

    revalidatePath(`/dashboard/${appId}`)
}

export async function requestModelAccess(appId: string, keyId: string, modelId: string, modelName: string) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
        throw new Error("Unauthorized")
    }

    // Verify ownership via app
    const key = await prisma.apiKey.findUnique({
        where: { id: keyId },
        include: { app: true }
    })

    if (!key || key.app.userId !== session.user.id) {
        throw new Error("Unauthorized")
    }

    // Notify administrators about the model request
    await notifyAdmin(`Model Access Requested: '${modelName}' for API Key '${key.name || "Default Key"}'`, {
        appId: key.app.id,
        appName: key.app.name,
        userEmail: session.user.email,
        userId: session.user.id,
        keyId: key.id,
        keyName: key.name,
        modelId,
        modelName,
        action: "requestModelAccess"
    })
}

export async function approveModelAccess(keyId: string, modelId: string, modelName: string, userId: string, notificationId: string) {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "admin") {
        throw new Error("Unauthorized")
    }

    // Connect model to API Key
    const updatedKey = await prisma.apiKey.update({
        where: { id: keyId },
        data: {
            models: {
                connect: { id: modelId }
            }
        },
        include: { app: true }
    })

    // Notify the user that their request was approved
    await notifyUser(userId, `Approved: Model '${modelName}' is now active for API Key '${updatedKey.name || "Default Key"}'`, {
        action: "modelAccessApproved",
        keyId,
        modelId
    })

    // Revalidate paths
    revalidatePath(`/dashboard/${updatedKey.appId}`)
    revalidatePath("/admin/keys")
}

// Admin Actions

export async function createModel(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "admin") {
        throw new Error("Unauthorized")
    }

    const name = formData.get("name") as string
    const apiId = formData.get("apiId") as string
    const endpoint = formData.get("endpoint") as string
    const description = formData.get("description") as string
    const engineId = formData.get("engineId") as string | null

    if (!name || !apiId || !endpoint) throw new Error("Missing fields")

    await prisma.model.create({
        data: {
            name,
            apiId,
            endpoint,
            description,
            engineId: engineId || null,
            isActive: true
        }
    })

    revalidatePath("/admin/models")
}

export async function toggleModelStatus(modelId: string, isActive: boolean) {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "admin") {
        throw new Error("Unauthorized")
    }

    await prisma.model.update({
        where: { id: modelId },
        data: { isActive }
    })

    revalidatePath("/admin/models")
}

export async function deleteModel(modelId: string) {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "admin") {
        throw new Error("Unauthorized")
    }

    await prisma.model.delete({
        where: { id: modelId }
    })

    revalidatePath("/admin/models")
}

// Inference Engine Actions

export async function createEngine(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "admin") {
        throw new Error("Unauthorized")
    }

    const name = formData.get("name") as string
    const type = formData.get("type") as string
    const baseUrl = formData.get("baseUrl") as string
    const apiKey = formData.get("apiKey") as string | null
    const description = formData.get("description") as string | null

    if (!name || !type || !baseUrl) throw new Error("Missing fields")

    const newEngine = await prisma.inferenceEngine.create({
        data: {
            name,
            type,
            baseUrl,
            apiKey: apiKey || null,
            description: description || null,
            isActive: true
        }
    })

    // Fetch models and add them
    try {
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

        const headers: Record<string, string> = {}
        if (apiKey) {
            headers["Authorization"] = `Bearer ${apiKey}`
        }

        const response = await fetch(healthUrl, { method: "GET", headers, signal: AbortSignal.timeout(8000) })

        if (response.ok) {
            let models: string[] = []
            const data = await response.json()

            if (type === "ollama" && data.models) {
                models = data.models.map((m: any) => m.name || m.model)
            } else if (data.data) {
                models = data.data.map((m: any) => m.id)
            }

            for (const modelId of models) {
                // Check if model already exists
                const existingModel = await prisma.model.findUnique({
                    where: { apiId: modelId }
                })

                if (!existingModel) {
                    const endpoint = type === "ollama"
                        ? `${baseUrl.replace(/\/$/, "")}/api/generate`
                        : `${baseUrl.replace(/\/$/, "")}/v1/chat/completions`

                    await prisma.model.create({
                        data: {
                            name: modelId,
                            apiId: modelId,
                            endpoint,
                            isActive: true,
                            engineId: newEngine.id
                        }
                    })
                }
            }
        }
    } catch (e) {
        console.error("Failed to fetch models for newly created engine:", e)
    }

    revalidatePath("/admin/models")
}

export async function updateEngine(engineId: string, data: { name?: string; baseUrl?: string; apiKey?: string | null; isActive?: boolean }) {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "admin") {
        throw new Error("Unauthorized")
    }

    await prisma.inferenceEngine.update({
        where: { id: engineId },
        data
    })

    revalidatePath("/admin/models")
}

export async function toggleEngineStatus(engineId: string, isActive: boolean) {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "admin") {
        throw new Error("Unauthorized")
    }

    await prisma.inferenceEngine.update({
        where: { id: engineId },
        data: { isActive }
    })

    revalidatePath("/admin/models")
}

export async function deleteEngine(engineId: string) {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "admin") {
        throw new Error("Unauthorized")
    }

    // Check for linked models first
    const modelCount = await prisma.model.count({ where: { engineId } })
    if (modelCount > 0) {
        throw new Error(`Cannot delete: ${modelCount} model(s) are linked to this engine. Remove them first.`)
    }

    await prisma.inferenceEngine.delete({
        where: { id: engineId }
    })

    revalidatePath("/admin/models")
}

export async function toggleKeyStatus(keyId: string, isActive: boolean) {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "admin") {
        throw new Error("Unauthorized")
    }

    await prisma.apiKey.update({
        where: { id: keyId },
        data: { active: isActive }
    })

    revalidatePath("/admin/keys")
}

export async function deleteApiKeyAdmin(keyId: string) {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "admin") {
        throw new Error("Unauthorized")
    }

    await prisma.apiKey.delete({
        where: { id: keyId }
    })

    revalidatePath("/admin/keys")
}

export async function editApiKeyName(keyId: string, name: string, appId: string) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
        throw new Error("Unauthorized")
    }

    // Verify ownership via app
    const key = await prisma.apiKey.findUnique({
        where: { id: keyId },
        include: { app: true }
    })

    if (!key || key.app.userId !== session.user.id) {
        throw new Error("Unauthorized")
    }

    await prisma.apiKey.update({
        where: { id: keyId },
        data: { name }
    })

    revalidatePath(`/dashboard/${appId}`)
}

export async function updateApiKeyModelsAdmin(keyId: string, modelIds: string[]) {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "admin") {
        throw new Error("Unauthorized")
    }

    await prisma.apiKey.update({
        where: { id: keyId },
        data: {
            models: {
                set: modelIds.map(id => ({ id }))
            }
        }
    })

    revalidatePath("/admin/keys")
}
