"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect root to user signup page as requested
    router.push("/auth/user/signup")
  }, [router])

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse">Loading...</div>
    </main>
  )
}
