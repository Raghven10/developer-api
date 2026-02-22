"use client"

import { useState } from "react"
import { Play, Loader2, Bot, User, CheckCircle2, AlertCircle, Settings2, ChevronDown, ChevronUp } from "lucide-react"
import ReactMarkdown from "react-markdown"

type ApiKey = {
    id: string
    name: string | null
    key: string
    active: boolean
    models: { apiId: string, name: string }[]
}

export function ApiTestPlayground({ apiKeys }: { apiKeys: ApiKey[] }) {
    const activeKeys = apiKeys.filter(k => k.active && k.models.length > 0)

    const [selectedKeyId, setSelectedKeyId] = useState<string>(activeKeys[0]?.id || "")
    const selectedKey = activeKeys.find(k => k.id === selectedKeyId)

    const [selectedModel, setSelectedModel] = useState<string>(selectedKey?.models[0]?.apiId || "")
    const [prompt, setPrompt] = useState("")
    const [rawRequest, setRawRequest] = useState<any>(null)
    const [rawResponse, setRawResponse] = useState<any>(null)
    const [streamingContent, setStreamingContent] = useState<string>("")
    const [metrics, setMetrics] = useState<{ ttfb: number | null, totalTime: number | null, tokensPerSecond: number | null, tokenCount: number | null } | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Advanced Options State
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [systemPrompt, setSystemPrompt] = useState("")
    const [temperature, setTemperature] = useState<number>(0.7)
    const [maxTokens, setMaxTokens] = useState<number>(1024)
    const [streamContext, setStreamContext] = useState<boolean>(true)

    // Ensure model selection is valid for the selected key
    if (selectedKey && !selectedKey.models.find(m => m.apiId === selectedModel)) {
        if (selectedKey.models.length > 0) {
            setSelectedModel(selectedKey.models[0].apiId)
        }
    }

    const handleTest = async () => {
        if (!selectedKey || !selectedModel || !prompt.trim()) return

        setIsLoading(true)
        setError(null)
        setRawRequest(null)
        setRawResponse(null)
        setStreamingContent("")
        setMetrics(null)

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
        const apiUrl = `${baseUrl}/api/v1/chat/completions`

        const messages: any[] = []
        if (systemPrompt.trim()) {
            messages.push({ role: "system", content: systemPrompt })
        }
        messages.push({ role: "user", content: prompt })

        const requestBody = {
            model: selectedModel,
            messages: messages,
            temperature: temperature,
            max_tokens: maxTokens,
            stream: streamContext
        }

        setRawRequest({
            method: 'POST',
            url: apiUrl,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${selectedKey.key.substring(0, 10)}...${selectedKey.key.slice(-4)}`
            },
            body: requestBody
        })

        try {
            const startTime = performance.now()
            let ttfb = 0

            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${selectedKey.key}`
                },
                body: JSON.stringify(requestBody)
            })

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                setRawResponse({ status: res.status, ok: res.ok, data: errorData })
                throw new Error(errorData.error?.message || "Failed to fetch response from the gateway")
            }

            const isJson = res.headers.get("content-type")?.includes("application/json")

            if (isJson || !res.body || !streamContext) {
                const data = await res.json()
                setRawResponse({ status: res.status, ok: res.ok, data })
                if (data.choices?.[0]?.message?.content) {
                    setStreamingContent(data.choices[0].message.content)
                }

                const endTime = performance.now()
                const totalTimeMs = endTime - startTime
                const tokenCount = data.usage?.total_tokens || data.usage?.completion_tokens || 0
                setMetrics({
                    ttfb: totalTimeMs, // Appoximation for non-streaming
                    totalTime: totalTimeMs,
                    tokenCount: tokenCount,
                    tokensPerSecond: tokenCount > 0 ? (tokenCount / (totalTimeMs / 1000)) : 0
                })
                return
            }

            const reader = res.body.getReader()
            const decoder = new TextDecoder("utf-8")
            let done = false
            let fullText = ""
            let firstChunkReceived = false

            let finalJson: any = {
                id: `chatcmpl-${Math.random().toString(36).substring(2, 10)}`,
                object: "chat.completion",
                created: Math.floor(Date.now() / 1000),
                model: selectedModel,
                choices: [{
                    index: 0,
                    message: {
                        role: "assistant",
                        content: ""
                    },
                    finish_reason: "stop"
                }],
                usage: null
            }
            let usageData: any = null

            while (!done) {
                const { value, done: readerDone } = await reader.read()
                done = readerDone
                if (value) {
                    if (!firstChunkReceived) {
                        firstChunkReceived = true
                        ttfb = performance.now() - startTime
                    }

                    const chunk = decoder.decode(value, { stream: true })
                    const lines = chunk.split("\n")

                    for (const line of lines) {
                        if (line.startsWith("data: ") && line !== "data: [DONE]") {
                            try {
                                const parsed = JSON.parse(line.slice(6))

                                if (parsed.id) finalJson.id = parsed.id
                                if (parsed.created) finalJson.created = parsed.created

                                const contentDelta = parsed.choices?.[0]?.delta?.content || ""
                                fullText += contentDelta
                                setStreamingContent(fullText)

                                if (parsed.usage || parsed.x_groq?.usage) {
                                    usageData = parsed.usage || parsed.x_groq?.usage
                                }
                            } catch (e) {
                                // Ignore parse errors for incomplete chunks
                            }
                        }
                    }
                }
            }

            const endTime = performance.now()
            const totalTimeMs = endTime - startTime
            const estimatedTokens = usageData?.total_tokens || usageData?.completion_tokens || Math.ceil(fullText.length / 4)
            const tps = estimatedTokens / (totalTimeMs / 1000)

            setMetrics({
                ttfb: ttfb,
                totalTime: totalTimeMs,
                tokenCount: estimatedTokens,
                tokensPerSecond: tps
            })

            finalJson.choices[0].message.content = fullText
            finalJson.usage = usageData || {
                prompt_tokens: 0,
                completion_tokens: estimatedTokens,
                total_tokens: estimatedTokens
            }

            setRawResponse({
                status: res.status,
                ok: res.ok,
                data: finalJson
            })

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.")
        } finally {
            setIsLoading(false)
        }
    }

    if (activeKeys.length === 0) {
        return (
            <div className="card border-dashed border-white/10 opacity-70 flex flex-col items-center justify-center p-8 text-center">
                <p className="text-gray-400 text-sm mb-2">No active API Keys available for testing.</p>
                <p className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">Create a key and assign models to enable the playground.</p>
            </div>
        )
    }

    return (
        <div className="card glass border-indigo-500/20 shadow-[0_8px_32px_-12px_rgba(99,102,241,0.2)]">
            <div className="mb-6 pb-6 border-b border-white/5">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <Play className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">API Playground</h2>
                        <p className="text-xs text-gray-400">Test your Unified Gateway configuration directly in the browser.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Select API Key</label>
                    <select
                        className="input cursor-pointer bg-white/5 border-white/10 hover:border-indigo-500/30 transition-colors"
                        value={selectedKeyId}
                        onChange={(e) => setSelectedKeyId(e.target.value)}
                    >
                        {activeKeys.map(k => (
                            <option key={k.id} value={k.id} className="bg-[#0f0f14] text-gray-200">
                                {k.name} ({k.key.substring(0, 12)}...)
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Target Model</label>
                    <select
                        className="input cursor-pointer bg-white/5 border-white/10 hover:border-indigo-500/30 transition-colors disabled:opacity-50"
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        disabled={!selectedKey || selectedKey.models.length === 0}
                    >
                        {selectedKey?.models.map(m => (
                            <option key={m.apiId} value={m.apiId} className="bg-[#0f0f14] text-gray-200">
                                {m.name} ({m.apiId})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Advanced Options Toggle */}
            <div className="mb-4">
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-indigo-400 transition-colors uppercase tracking-wider"
                >
                    <Settings2 className="w-3.5 h-3.5" />
                    Advanced Tuning Options
                    {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
            </div>

            {/* Advanced Options Panel */}
            {showAdvanced && (
                <div className="mb-6 p-4 rounded-xl border border-white/5 bg-black/20 space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">System Prompt</label>
                        <textarea
                            className="input min-h-[60px] resize-y bg-black/40 border-white/5 focus:border-indigo-500/30 text-xs"
                            placeholder="You are a helpful assistant..."
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center justify-between">
                                Temperature <span>{temperature.toFixed(2)}</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={temperature}
                                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                className="w-full accent-indigo-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center justify-between">
                                Max Tokens <span>{maxTokens}</span>
                            </label>
                            <input
                                type="range"
                                min="100"
                                max="8192"
                                step="100"
                                value={maxTokens}
                                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                                className="w-full accent-indigo-500"
                            />
                        </div>
                        <div className="space-y-2 flex flex-col justify-center pt-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={streamContext}
                                    onChange={(e) => setStreamContext(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-600 text-indigo-500 focus:ring-indigo-500/20 bg-black/40 cursor-pointer"
                                />
                                <span className="text-xs font-bold text-gray-300">Stream Response</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <div className="relative group">
                    <textarea
                        className="input min-h-[100px] resize-y bg-black/20 border-white/10 focus:border-indigo-500/50 transition-colors p-4 text-sm"
                        placeholder="Enter your prompt here (e.g., 'What is the speed of light?')"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                handleTest()
                            }
                        }}
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-600 hidden group-hover:block transition-opacity">⌘ + Enter to send</span>
                        <button
                            className="btn btn-primary px-4 py-1.5 text-xs shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                            onClick={handleTest}
                            disabled={isLoading || !prompt.trim() || !selectedKey || !selectedModel}
                        >
                            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Send Request"}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-red-200">Gateway Error</p>
                            <p className="text-xs text-red-400 mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {(rawRequest || rawResponse) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6 mb-6">
                        {/* Request Panel */}
                        {rawRequest && (
                            <div className="rounded-2xl border border-white/5 overflow-hidden bg-black/40 flex flex-col">
                                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                        Request Payload
                                    </span>
                                </div>
                                <div className="p-4 overflow-x-auto custom-scrollbar flex-1 relative">
                                    <pre className="text-[11px] text-gray-300 font-mono m-0">
                                        {JSON.stringify(rawRequest, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* Response Panel */}
                        {rawResponse && (
                            <div className="rounded-2xl border border-white/5 overflow-hidden bg-black/40 flex flex-col">
                                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${rawResponse.ok ? 'text-emerald-400' : 'text-red-400'} flex items-center gap-1.5`}>
                                        {rawResponse.ok ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                        Response ({rawResponse.status})
                                    </span>
                                </div>
                                <div className="p-4 overflow-x-auto custom-scrollbar flex-1 relative">
                                    <pre className="text-[11px] text-gray-300 font-mono m-0">
                                        {JSON.stringify(rawResponse.data, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Live Chat Streaming UI */}
                {(streamingContent || isLoading) && !error && (
                    <div className="rounded-2xl border border-indigo-500/30 overflow-hidden bg-black/60 shadow-[0_8px_32px_-12px_rgba(99,102,241,0.15)] mb-6 mt-6">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-indigo-500/20 bg-indigo-500/5">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-indigo-400 animate-pulse' : 'bg-emerald-400'}`}></div>
                                <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
                                    {isLoading ? 'Streaming Response...' : 'Final Output'}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                {metrics && (
                                    <div className="hidden lg:flex items-center gap-3 text-[10px] font-mono text-indigo-200/70 border-r border-indigo-500/20 pr-4">
                                        <span title="Time to first byte">TTFB: {(metrics.ttfb || 0).toFixed(0)}ms</span>
                                        <span title="Total generated tokens">Tokens: {metrics.tokenCount}</span>
                                        <span title="Tokens per second">TPS: {(metrics.tokensPerSecond || 0).toFixed(1)}/s</span>
                                        <span title="Total time">Time: {((metrics.totalTime || 0) / 1000).toFixed(2)}s</span>
                                    </div>
                                )}
                                <span className="text-[10px] font-medium text-gray-400 font-mono flex items-center gap-1.5">
                                    <Bot className="w-3 h-3 text-indigo-400" /> {selectedModel}
                                </span>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="prose prose-invert max-w-none text-gray-200 text-sm leading-relaxed">
                                <ReactMarkdown>{streamingContent}</ReactMarkdown>
                                {isLoading && <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-400 animate-pulse align-middle"></span>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
