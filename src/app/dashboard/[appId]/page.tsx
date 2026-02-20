
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Box } from "lucide-react"
import { ApiKeyManager } from "@/components/ApiKeyManager"

async function getApp(appId: string, userId: string) {
    return await prisma.app.findUnique({
        where: { id: appId },
        include: {
            apiKeys: {
                orderBy: { createdAt: 'desc' }
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

    const app = await getApp(params.appId, session.user.id)

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
                    <ApiKeyManager appId={app.id} initialKeys={app.apiKeys} />
                </div>

                <div className="card">
                    <h3 className="text-xl font-bold mb-4">Model Access</h3>
                    <p className="text-gray-400 mb-4">You have access to the following models:</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {['Llama-3-70b', 'Mistral-Large', 'Gemma-7b'].map(model => (
                            <div key={model} className="p-4 bg-[var(--surface-hover)] rounded border border-[var(--border)] flex items-center justify-between">
                                <span className="font-medium">{model}</span>
                                <span className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded-full">Active</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
