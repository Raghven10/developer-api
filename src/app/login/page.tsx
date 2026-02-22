"use client"

import { signIn } from "next-auth/react"
import Link from "next/link"
import { ArrowLeft, Key, Shield, Zap, Sparkles, Lock } from "lucide-react"

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-fuchsia-600/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            <div className="w-full max-w-md relative">
                {/* Return Link */}
                <Link
                    href="/"
                    className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white mb-12 transition-all group"
                >
                    <ArrowLeft className="w-3.5 h-3.5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Core System
                </Link>

                {/* Login Container */}
                <div className="relative group">
                    {/* Glowing Perimeter */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

                    <div className="relative glass border-white/5 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden">
                        {/* Decorative internal elements */}
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles className="w-20 h-20 text-indigo-400" />
                        </div>

                        <div className="text-center mb-10">
                            <div className="relative inline-block mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center shadow-2xl shadow-indigo-500/20 relative z-10 transition-transform hover:rotate-3">
                                    <Key className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center z-20">
                                    <Shield className="w-4 h-4 text-emerald-400" />
                                </div>
                            </div>

                            <h1 className="text-3xl font-black tracking-tighter text-white mb-2 uppercase">
                                Access Portal
                            </h1>
                            <p className="text-gray-400 text-sm font-medium tracking-tight">
                                Authentication required for neural console access
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="relative">
                                <button
                                    onClick={() => signIn("keycloak", { callbackUrl: "/dashboard" })}
                                    className="w-full relative group/btn"
                                >
                                    <div className="absolute inset-0 bg-white rounded-2xl transition-all group-hover/btn:bg-indigo-50 " />
                                    <div className="relative px-8 py-4 flex items-center justify-center gap-3 text-black font-black text-xs uppercase tracking-[0.15em]">
                                        <Zap className="w-4 h-4 fill-black" />
                                        Initialize via Keycloak
                                    </div>
                                </button>
                            </div>

                            <div className="relative flex items-center gap-4 py-2">
                                <div className="h-px flex-1 bg-white/5" />
                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Security Protocol</span>
                                <div className="h-px flex-1 bg-white/5" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center gap-2">
                                    <Lock className="w-4 h-4 text-gray-500" />
                                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-tighter">AES-256 Encrypted</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center gap-2">
                                    <Shield className="w-4 h-4 text-gray-500" />
                                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-tighter">OAuth 2.0 Standard</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="mt-10 text-center space-y-4">
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.1em] max-w-xs mx-auto leading-relaxed">
                        By proceeding, you authorize session establishing and agree to neural network compliance.
                    </p>
                    <div className="flex items-center justify-center gap-4 pt-4">
                        <div className="h-1 w-1 rounded-full bg-indigo-500/50" />
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                            Restricted Node v4.2.0
                        </p>
                        <div className="h-1 w-1 rounded-full bg-fuchsia-500/50" />
                    </div>
                </div>
            </div>
        </div>
    )
}
