
import Link from "next/link"
import { ArrowRight, Code, Key, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full p-1 mb-8 animate-pulse">
        <div className="bg-black rounded-full px-4 py-1 text-sm font-medium">
          New: Llama-3-70b is now available
        </div>
      </div>

      <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
        Build with the future <br /> of intelligence
      </h1>

      <p className="text-xl text-gray-400 max-w-2xl mb-10">
        Access state-of-the-art open source models through a single, unified API.
        Designed for developers who demand performance, privacy, and control.
      </p>

      <div className="flex gap-4 mb-20">
        <Link href="/dashboard" className="btn btn-primary text-lg px-8 py-3">
          Get Started <ArrowRight className="w-5 h-5" />
        </Link>
        <Link href="/docs" className="btn btn-outline text-lg px-8 py-3">
          Read Docs
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl">
        <div className="card text-left">
          <Zap className="w-10 h-10 text-[var(--primary)] mb-4" />
          <h3 className="text-xl font-bold mb-2">Ultra Low Latency</h3>
          <p className="text-gray-400">
            Powered by vLLM for optimized inference speeds. Get tokens faster than ever before.
          </p>
        </div>

        <div className="card text-left">
          <Code className="w-10 h-10 text-[var(--primary)] mb-4" />
          <h3 className="text-xl font-bold mb-2">Simple API</h3>
          <p className="text-gray-400">
            Drop-in compatibility with OpenAI SDKs. Change the base URL and you're good to go.
          </p>
        </div>

        <div className="card text-left">
          <Key className="w-10 h-10 text-[var(--primary)] mb-4" />
          <h3 className="text-xl font-bold mb-2">Key Management</h3>
          <p className="text-gray-400">
            Granular control over API keys. Set limits, track usage, and revoke access instantly.
          </p>
        </div>
      </div>
    </div>
  )
}
