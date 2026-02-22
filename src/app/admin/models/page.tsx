
import { prisma } from "@/lib/prisma"
import { EngineManager } from "@/components/EngineManager"
import { ModelManager } from "@/components/ModelManager"
import { Cpu, Server, Activity, CheckCircle2 } from "lucide-react"

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

    const totalEngines = engines.length
    const activeEngines = engines.filter(e => e.isActive).length
    const totalModels = models.length
    const activeModels = models.filter(m => m.isActive).length

    return (
        <div className="max-w-6xl">
            <div className="mb-12">
                <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                        <Cpu className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-1">Models & Engines</h1>
                        <div className="flex items-center gap-2 text-violet-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                            <Activity className="w-3 h-3" /> Resource Infrastructure
                        </div>
                    </div>
                </div>
                <p className="text-gray-400 max-w-2xl mt-4">
                    Orchestrate your inference infrastructure. Connect new engine endpoints and manage the lifecycle of your deployed AI models.
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                <div className="group rounded-3xl p-6 glass border-white/5 hover:border-violet-500/30 transition-all duration-500">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20 group-hover:bg-violet-500/20 transition-all">
                            <Server className="w-5 h-5 text-violet-400" />
                        </div>
                        <div className="text-3xl font-black text-white">{totalEngines}</div>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-violet-400 transition-colors">Total Engines</div>
                </div>

                <div className="group rounded-3xl p-6 glass border-white/5 hover:border-emerald-500/30 transition-all duration-500">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="text-3xl font-black text-white">{activeEngines}</div>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-emerald-400 transition-colors">Active Engines</div>
                </div>

                <div className="group rounded-3xl p-6 glass border-white/5 hover:border-blue-500/30 transition-all duration-500">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-all">
                            <Cpu className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="text-3xl font-black text-white">{totalModels}</div>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-blue-400 transition-colors">Total Models</div>
                </div>

                <div className="group rounded-3xl p-6 glass border-white/5 hover:border-emerald-500/30 transition-all duration-500">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
                            <Activity className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="text-3xl font-black text-white">{activeModels}</div>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-emerald-400 transition-colors">Active Models</div>
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
