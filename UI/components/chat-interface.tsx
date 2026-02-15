"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Bot, User, Loader2, Sparkles, AlertCircle, MessageSquare, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { chat } from "@/lib/api"
import ReactMarkdown from 'react-markdown'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import DiseasePredictionForm from "./disease-prediction-form"

interface Message {
    id: number
    text: string
    sender: "user" | "bot"
    timestamp: Date
}



interface ChatInterfaceProps {
    onPredictionComplete?: (data: any) => void // Keeping any for now to match other file, or update both
}
// Wait, I should update the prop type.
// But the prop is passed from parent. Parent (UserDashboard) needs to match.
// I'll stick to improving internal types first or just use `any` if user insists on "all errors" and `no-explicit-any` is the error.
// Let's try to be specific.

export default function ChatInterface({ onPredictionComplete }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [sessionId, setSessionId] = useState<number | null>(null)
    const [error, setError] = useState("")
    const [availableDiseases, setAvailableDiseases] = useState<string[]>([])
    const [selectedDisease, setSelectedDisease] = useState<string>("")
    const [isSessionActive, setIsSessionActive] = useState(false)
    const [mode, setMode] = useState<"chat" | "form">("form")
    const scrollRef = useRef<HTMLDivElement>(null)

    // Fetch unique diseases
    useEffect(() => {
        const fetchDiseases = async () => {
            try {
                const res = await import('@/lib/api').then(m => m.predict.getUniqueDiseases());
                setAvailableDiseases(res.data);
                // Optional: Select first one by default if list is not empty and nothing selected
            } catch (err) {
                console.error("Failed to fetch diseases", err);
            }
        }
        fetchDiseases();
    }, []);

    // Start chat on mount
    /*
    useEffect(() => {
        startNewSession()
    }, [])
    */

    const startNewSession = async (disease: string) => {
        try {
            setIsLoading(true)
            setError("")
            const res = await chat.start(disease)
            setSessionId(res.data.session_id)
            setMessages([{
                id: 0,
                text: res.data.message,
                sender: "bot",
                timestamp: new Date()
            }])
            setIsSessionActive(true)
        } catch (err: any) {
            console.error(err)
            // Show friendlier error if from the strict check
            if (err.response && err.response.status === 404) {
                const msg = err.response.data.detail || "Dataset not found."
                setError(msg)
                toast.error("Dataset Missing", { description: msg, duration: 5000 })
            } else {
                setError("Failed to start chat session.")
                toast.error("Connection Error", { description: "Failed to connect to the server." })
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleDiseaseSelect = (value: string) => {
        setSelectedDisease(value)
        startNewSession(value)
    }

    const handleSend = async () => {
        if (!input.trim() || !sessionId) return

        const userText = input
        setInput("")

        // Optimistic Update
        const newMsg: Message = {
            id: Date.now(),
            text: userText,
            sender: "user",
            timestamp: new Date()
        }
        setMessages(prev => [...prev, newMsg])
        setIsLoading(true)

        try {
            const res = await chat.message(sessionId, userText)
            const botMsg: Message = {
                id: Date.now() + 1,
                text: res.data.response,
                sender: "bot",
                timestamp: new Date()
            }
            setMessages(prev => [...prev, botMsg])

            if (res.data.status === "completed") {
                // Handle completion (maybe show confetti or summary)
                if (onPredictionComplete && res.data.prediction) {
                    onPredictionComplete(res.data.prediction)
                }
            }

        } catch (err) {
            console.error(err)
            setError("Failed to send message.")
        } finally {
            setIsLoading(false)
        }
    }

    // Auto scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
        }
    }, [messages])

    return (
        <Card className="w-full flex flex-col border-0 bg-white/80 backdrop-blur-sm shadow-xl overflow-hidden mt-6 h-[75vh] min-h-[600px]">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-white text-xl">AI Health Assistant</CardTitle>
                            <p className="text-blue-100 text-sm">
                                {mode === "chat" ? "Interactive Disease Risk Assessment" : "Form-based Disease Risk Assessment"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Toggle Button */}
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-xl p-1">
                            <Button
                                type="button"
                                onClick={() => setMode("form")}
                                className={`h-9 px-4 rounded-lg transition-all ${mode === "form"
                                    ? "bg-white text-blue-600 shadow-md"
                                    : "bg-transparent text-white hover:bg-white/10"
                                    }`}
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Form
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setMode("chat")}
                                className={`h-9 px-4 rounded-lg transition-all ${mode === "chat"
                                    ? "bg-white text-blue-600 shadow-md"
                                    : "bg-transparent text-white hover:bg-white/10"
                                    }`}
                            >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Chat
                            </Button>
                        </div>

                        {mode === "chat" && (
                            <div className="w-[200px]">
                                <Select value={selectedDisease} onValueChange={handleDiseaseSelect} disabled={isLoading && isSessionActive}>
                                    <SelectTrigger className="bg-white text-slate-800 border-0 focus:ring-offset-0 focus:ring-0 shadow-md">
                                        <SelectValue placeholder="Select Disease" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white text-slate-800">
                                        {availableDiseases.length > 0 ? (
                                            availableDiseases.map((d) => (
                                                <SelectItem key={d} value={d}>{d}</SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="none" disabled>No Datasets Uploaded</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden relative bg-slate-50">
                {mode === "form" ? (
                    <ScrollArea className="h-full p-6">
                        <DiseasePredictionForm onPrediction={onPredictionComplete || (() => { })} />
                    </ScrollArea>
                ) : (
                    <ScrollArea className="h-full p-6" ref={scrollRef}>
                        <div className="space-y-6 pb-4">
                            {!isSessionActive && !isLoading && !error && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 mt-20">
                                    <Bot className="w-16 h-16 mb-4 opacity-20" />
                                    <p>Please select a specific disease above to start the assessment.</p>
                                </div>
                            )}
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex items-start gap-4 ${msg.sender === "user" ? "flex-row-reverse" : ""
                                        } animate-slide-up`}
                                >
                                    <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${msg.sender === "user"
                                            ? "bg-gradient-to-br from-blue-500 to-blue-600"
                                            : "bg-gradient-to-br from-purple-500 to-purple-600"
                                            }`}
                                    >
                                        {msg.sender === "user" ? (
                                            <User className="w-6 h-6 text-white" />
                                        ) : (
                                            <Bot className="w-6 h-6 text-white" />
                                        )}
                                    </div>

                                    <div
                                        className={`relative max-w-[80%] p-4 rounded-2xl shadow-sm ${msg.sender === "user"
                                            ? "bg-white border border-blue-100 text-slate-800 rounded-tr-none"
                                            : "bg-white border border-purple-100 text-slate-800 rounded-tl-none"
                                            }`}
                                    >
                                        <div className="prose prose-sm max-w-none text-slate-700">
                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                                        </div>
                                        <span className="text-[10px] text-slate-400 mt-2 block opacity-70">
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex items-start gap-4 animate-pulse">
                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <Bot className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div className="bg-white border border-purple-50 p-4 rounded-2xl rounded-tl-none shadow-sm">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                                            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                                            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 mx-auto w-fit">
                                    <AlertCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">{error}</span>
                                </div>
                            )}

                            {/* Invisble Viewport Anchor */}
                            <div ref={el => { if (el) scrollRef.current = el.parentElement as HTMLDivElement }} />
                        </div>
                    </ScrollArea>
                )}
            </CardContent>

            {mode === "chat" && (
                <CardFooter className="p-4 bg-white border-t border-slate-100">
                    <div className="flex gap-2 w-full mx-auto">
                        <Input
                            placeholder="Type your answer here..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            disabled={isLoading}
                            className="flex-1 h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 bg-slate-50"
                        />
                        <Button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim() || !isSessionActive}
                            className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 p-0 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                            ) : (
                                <Send className="w-5 h-5 text-white" />
                            )}
                        </Button>
                    </div>
                </CardFooter>
            )}

            <style jsx>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
        </Card>
    )
}
