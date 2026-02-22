"use client"

import { Terminal, Code, Cpu, Shield, Copy, Check, ExternalLink, MessageSquare } from "lucide-react"
import { useState } from "react"

export default function DocsPage() {
    const [activeTab, setActiveTab] = useState("curl")
    const [copied, setCopied] = useState(false)

    // Use environment variable for the base URL, fallback to localhost for development
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const apiUrl = `${baseUrl}/api/v1`

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const codeExamples = {
        curl: `curl ${apiUrl}/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "llama-3-8b-instruct",
    "messages": [
      {"role": "user", "content": "How do I build a futuristic UI?"}
    ]
  }'`,
        python: `import openai

client = openai.OpenAI(
    api_key="YOUR_API_KEY",
    base_url="${apiUrl}"
)

response = client.chat.completions.create(
    model="llama-3-8b-instruct",
    messages=[
        {"role": "user", "content": "Tell me about quantum computing."}
    ]
)

print(response.choices[0].message.content)`,
        javascript: `const response = await fetch("${apiUrl}/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "llama-3-8b-instruct",
    messages: [
      { role: "user", content: "What is glassmorphism?" }
    ]
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);`
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-12 pb-24 px-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-16 text-center lg:text-left">
                    <div className="flex flex-col lg:flex-row items-center gap-6 mb-6">
                        <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-indigo-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/20 relative group">
                            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-50" />
                            <Code className="w-8 h-8 text-white relative z-10" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-black tracking-tighter text-white mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                                API Documentation
                            </h1>
                            <div className="flex items-center justify-center lg:justify-start gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em]">
                                <Shield className="w-3.5 h-3.5" /> High-Performance AI Backbone
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-400 max-w-2xl mx-auto lg:mx-0 text-lg font-medium leading-relaxed">
                        Integrate our proprietary AI models into your applications with our standard OpenAI-compatible API. Access powerful features with a single endpoint and unified authentication.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Essential Info */}
                    <div className="space-y-6">
                        <div className="p-8 rounded-[2rem] glass border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                                    <Terminal className="w-4 h-4" /> Gateway Endpoint
                                </h3>
                                <div className="group relative">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-xl blur opacity-50 group-hover:opacity-100 transition duration-500" />
                                    <code className="relative block p-4 rounded-xl bg-black border border-white/10 text-xs text-gray-300 font-mono break-all group-hover:border-indigo-500/30 transition-colors">
                                        {apiUrl}
                                    </code>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-2">
                                    <Cpu className="w-4 h-4" /> Model Access
                                </h3>
                                <p className="text-xs text-gray-500 leading-relaxed font-bold">
                                    Browse available models and manage your access directly from the platform.
                                </p>
                                <a href="/dashboard" className="inline-flex items-center gap-2 text-xs font-black text-white hover:text-indigo-400 transition-all group/link mt-2">
                                    Explore Models <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                </a>
                            </div>

                            <div className="pt-6 border-t border-white/5">
                                <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest leading-relaxed">
                                    All requests must follow the <span className="text-indigo-500/50">OpenAI Chat Completions</span> standard.
                                </p>
                            </div>
                        </div>

                        <div className="p-8 rounded-[2rem] border border-indigo-500/10 bg-indigo-500/[0.02] space-y-4">
                            <h4 className="text-xs font-black text-white">Authentication</h4>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                Use your secret API key in the Authorization header as a Bearer token.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Code playground */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="rounded-[2.5rem] border border-white/5 bg-[#0a0a0f] overflow-hidden shadow-2xl relative group">
                            {/* Static Glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] -mr-32 -mt-32" />

                            <div className="relative">
                                {/* Code Header / Tabs */}
                                <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-white/[0.02]">
                                    <div className="flex items-center gap-8">
                                        {Object.keys(codeExamples).map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`text-[10px] font-black uppercase tracking-[0.25em] transition-all relative py-2 ${activeTab === tab ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
                                            >
                                                {tab}
                                                {activeTab === tab && (
                                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_10px_#6366f1]" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(codeExamples[activeTab as keyof typeof codeExamples])}
                                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition-all flex items-center gap-2 group/copy"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 group-hover/copy:scale-110 transition-transform" />}
                                        <span className="text-[10px] font-black">{copied ? "COPIED" : "COPY"}</span>
                                    </button>
                                </div>

                                {/* Code Body */}
                                <div className="p-10 font-mono text-[13px] overflow-x-auto custom-scrollbar bg-black/40">
                                    <pre className="text-gray-400 leading-loose">
                                        {codeExamples[activeTab as keyof typeof codeExamples]}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        {/* Integration Guide Section */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-black tracking-tight flex items-center gap-4 text-white">
                                <MessageSquare className="w-8 h-8 text-indigo-500" />
                                Integration Guide
                            </h2>
                            <p className="text-gray-400 leading-relaxed text-lg font-medium">
                                Our API follows the industry-standard structure, ensuring effortless integration into existing workflows. Simply configure your client with your unique <code className="text-indigo-400 bg-indigo-500/5 px-1.5 py-0.5 rounded">API Key</code> and chosen <code className="text-indigo-400 bg-indigo-500/5 px-1.5 py-0.5 rounded">Model ID</code>.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Endpoint URL</h4>
                                    <p className="text-sm font-bold text-gray-200 font-mono">/v1/chat/completions</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Auth Format</h4>
                                    <p className="text-sm font-bold text-gray-200 font-mono">Bearer &lt;TOKEN&gt;</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
