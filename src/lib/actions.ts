
"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { randomBytes } from "crypto"

export async function createApp(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
        throw new Error("Unauthorized")
    }

    const name = formData.get("name") as string
    if (!name || name.trim().length === 0) {
        throw new Error("Name is required")
    }

    await prisma.app.create({
        data: {
            name,
            userId: session.user.id
        }
    })

    revalidatePath("/dashboard")
    redirect("/dashboard")
}

export async function createApiKey(appId: string, name: string) {
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

    const newKey = await prisma.apiKey.create({
        data: {
            key,
            name,
            appId
        }
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

    await prisma.inferenceEngine.create({
        data: {
            name,
            type,
            baseUrl,
            apiKey: apiKey || null,
            description: description || null,
            isActive: true
        }
    })

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
