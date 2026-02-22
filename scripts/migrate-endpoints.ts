import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("Standardizing model endpoints...")

    // Find all models that belong to an engine of type "ollama"
    const models = await prisma.model.findMany({
        include: { engine: true }
    })

    let updated = 0
    for (const model of models) {
        if (model.engine?.type === "ollama") {
            const baseUrl = model.engine.baseUrl.replace(/\/$/, "")
            const newEndpoint = `${baseUrl}/v1/chat/completions`

            if (model.endpoint !== newEndpoint) {
                console.log(`Updating ${model.apiId}: ${model.endpoint} -> ${newEndpoint}`)
                await prisma.model.update({
                    where: { id: model.id },
                    data: { endpoint: newEndpoint }
                })
                updated++
            }
        }
    }

    console.log(`Done. Updated ${updated} model(s).`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
