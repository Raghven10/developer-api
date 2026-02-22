
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Box } from "lucide-react"
import { ApiKeyManager } from "@/components/ApiKeyManager"
import { PlatformModelsList } from "@/components/PlatformModelsList"
import { getPublicModels } from "@/lib/actions"

async function getApp(appId: string, userId: string) {
    return await prisma.app.findUnique({
        where: { id: appId },
        include: {
            apiKeys: {
                orderBy: { createdAt: 'desc' },
                include: { models: true }
            }
        }
    })
}

export default async function AppDetailsPage(props: { params: Promise<{ appId: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
        redirect("/api/auth/signin")
    }

    const [app, publicModels] = await Promise.all([
        getApp(params.appId, session.user.id),
        getPublicModels()
    ])

    if (!app) {
        notFound()
    }

    // Security check: Ensure the app belongs to the user
    if (app.userId !== session.user.id) {
        redirect("/dashboard")
    }

    return (
        <div className="container py-10">
            <Link href="/dashboard" className="flex items-center text-sm text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to dashboard
            </Link>

            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
                    <Box className="w-8 h-8 text-[var(--primary)]" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">{app.name}</h1>
                    <p className="text-gray-400">Application ID: <code className="bg-black/30 px-2 py-1 rounded text-xs">{app.id}</code></p>
                </div>
            </div>

            <div className="grid gap-8">
                <div className="card">
                    <ApiKeyManager appId={app.id} initialKeys={app.apiKeys} publicModels={publicModels} />
                </div>

                <PlatformModelsList app={app} publicModels={publicModels} />
            </div>
        </div>
    )
}
