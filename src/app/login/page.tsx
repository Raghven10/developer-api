"use client"

import { signIn } from "next-auth/react"
import Link from "next/link"
import { ArrowLeft, Key } from "lucide-react"

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background with gradient elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[100px]" />
            </div>

            <div className="w-full max-w-md">
                <Link href="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>

                <div className="card border-t-purple-500/50">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
                            <Key className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
                        <p className="text-gray-400 text-sm">Sign in to access your developer console</p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => signIn("keycloak", { callbackUrl: "/dashboard" })}
                            className="w-full btn btn-primary py-3 relative overflow-hidden group"
                        >
                            <span className="relative z-10">Sign in with Keycloak</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[var(--border)]"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[var(--surface)] px-2 text-gray-500">Secure Access</span>
                            </div>
                        </div>

                        <p className="text-center text-xs text-gray-500">
                            By continuing, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </div>

                <p className="text-center mt-6 text-sm text-gray-500">
                    Don't have an account? Contact your administrator.
                </p>
            </div>
        </div>
    )
}
