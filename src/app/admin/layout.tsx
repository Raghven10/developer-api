import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/AdminSidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
        redirect("/")
    }

    return (
        <div className="w-full max-w-[1600px] mx-auto mt-8 pt-10 pb-10 px-4 md:px-12">
            <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start">
                <AdminSidebar />
                <main className="flex-1 min-w-0 w-full overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    )
}
