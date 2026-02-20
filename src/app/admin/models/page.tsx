
import { prisma } from "@/lib/prisma"
import { EngineManager } from "@/components/EngineManager"
import { ModelManager } from "@/components/ModelManager"

async function getEngines() {
    return await prisma.inferenceEngine.findMany({
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { models: true } } }
    })
}

async function getModels() {
    return await prisma.model.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            engine: {
                select: { name: true, type: true }
            }
        }
    })
}

export default async function AdminModelsPage() {
    const [engines, models] = await Promise.all([getEngines(), getModels()])

    // Stats
    const totalEngines = engines.length
    const activeEngines = engines.filter(e => e.isActive).length
    const totalModels = models.length
    const activeModels = models.filter(m => m.isActive).length

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Models & Engines</h1>
            <p className="text-gray-400 mb-8">Manage inference engine connections and registered models.</p>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="card !p-4 text-center">
                    <div className="text-2xl font-bold text-white">{totalEngines}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Engines</div>
                </div>
                <div className="card !p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{activeEngines}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Active Engines</div>
                </div>
                <div className="card !p-4 text-center">
                    <div className="text-2xl font-bold text-white">{totalModels}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Models</div>
                </div>
                <div className="card !p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{activeModels}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Active Models</div>
                </div>
            </div>

            {/* Inference Engines Section */}
            <div className="mb-8">
                <EngineManager engines={JSON.parse(JSON.stringify(engines))} />
            </div>

            {/* Models Section */}
            <ModelManager
                models={JSON.parse(JSON.stringify(models))}
                engines={JSON.parse(JSON.stringify(engines.filter(e => e.isActive).map(e => ({
                    id: e.id,
                    name: e.name,
                    type: e.type,
                    baseUrl: e.baseUrl
                }))))}
            />
        </div>
    )
}
