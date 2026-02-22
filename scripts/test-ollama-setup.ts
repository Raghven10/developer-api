import { PrismaClient } from "@prisma/client"
import crypto from "crypto"

const prisma = new PrismaClient()

async function main() {
    // 1. Create or find a test user
    const user = await prisma.user.upsert({
        where: { email: "test-unified@example.com" },
        update: {},
        create: {
            email: "test-unified@example.com",
            name: "Test Unified User",
            role: "user"
        }
    })

    // 2. Ensure an App exists
    const app = await prisma.app.findFirst({ where: { userId: user.id } }) || await prisma.app.create({
        data: {
            name: "CLI Test App",
            userId: user.id
        }
    })

    // 3. Ensure an Ollama Engine exists
    const engine = await prisma.inferenceEngine.upsert({
        where: { name: "Local Ollama" },
        update: {},
        create: {
            name: "Local Ollama",
            type: "ollama",
            baseUrl: "http://localhost:11434"
        }
    })

    // 4. Ensure an Ollama Model exists for an actually pulled model
    const model = await prisma.model.upsert({
        where: { apiId: "qwen3:latest" },
        update: {
            endpoint: "http://localhost:11434/v1/chat/completions"
        },
        create: {
            name: "Qwen 3",
            apiId: "qwen3:latest",
            endpoint: "http://localhost:11434/v1/chat/completions",
            engineId: engine.id
        }
    })

    // 5. Create an API Key linked to the model
    const keyString = "sk-" + crypto.randomBytes(24).toString("hex")
    const apiKey = await prisma.apiKey.create({
        data: {
            key: keyString,
            name: "Test CLI Key Qwen",
            appId: app.id,
            active: true,
            models: {
                connect: { id: model.id }
            }
        }
    })

    console.log("=== API KEY GENERATED ===")
    console.log("API Key:", keyString)
    console.log("Model ID:", model.apiId)
    console.log("=========================")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
