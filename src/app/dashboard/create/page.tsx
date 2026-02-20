
import { createApp } from "@/lib/actions"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function CreateAppPage() {
    return (
        <div className="container max-w-lg py-20">
            <Link href="/dashboard" className="flex items-center text-sm text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to dashboard
            </Link>

            <div className="card">
                <h1 className="text-2xl font-bold mb-6">Create New Application</h1>

                <form action={createApp} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
                            Application Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            placeholder="e.g. My Awesome Startup"
                            required
                            className="input bg-[var(--surface-hover)]"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full justify-center">
                        Create Application
                    </button>
                </form>
            </div>
        </div>
    )
}
