
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, Box } from "lucide-react"

async function getApps(userId: string) {
    return await prisma.app.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { apiKeys: true } } }
    })
}

export default async function Dashboard() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/api/auth/signin")
    }

    // We know session.user.id exists because of our auth setup callbacks
    // But typescript might need check or casting if types aren't fully picked up in this context without stricter types
    const userId = session.user.id
    const apps = await getApps(userId)

    return (
        <div className="container py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">My Apps</h1>
                    <p className="text-gray-400">Manage your applications and API keys.</p>
                </div>
                <Link href="/dashboard/create" className="btn btn-primary">
                    <Plus className="w-4 h-4" /> Create App
                </Link>
            </div>

            {apps.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-[var(--border)] rounded-lg">
                    <Box className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No apps yet</h3>
                    <p className="text-gray-400 mb-6">Get started by creating your first application.</p>
                    <Link href="/dashboard/create" className="btn btn-primary">
                        Create App
                    </Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {apps.map((app: any) => (
                        <Link key={app.id} href={`/dashboard/${app.id}`} className="card hover:border-[var(--primary)] group cursor-pointer">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 bg-[var(--surface-hover)] rounded-md">
                                    <Box className="w-6 h-6 text-[var(--primary)]" />
                                </div>
                                <span className="text-xs text-gray-500 bg-[var(--surface-hover)] px-2 py-1 rounded-full">
                                    {app._count.apiKeys} Keys
                                </span>
                            </div>
                            <h3 className="text-lg font-bold mb-1 group-hover:text-[var(--primary)] transition-colors">{app.name}</h3>
                            <p className="text-sm text-gray-400">Created on {app.createdAt.toLocaleDateString()}</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
