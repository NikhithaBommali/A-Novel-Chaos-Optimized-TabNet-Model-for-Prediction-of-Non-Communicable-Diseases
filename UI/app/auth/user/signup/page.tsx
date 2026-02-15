"use client"

import { useRouter } from "next/navigation"
import UserSignup from "@/components/user-signup"

export default function UserSignupPage() {
    const router = useRouter()

    const handleSignup = (name: string, role: "user") => {
        localStorage.setItem("userRole", role)
        localStorage.setItem("userName", name)
        router.push("/user/dashboard")
    }

    return (
        <div className="min-h-screen bg-background">
            <UserSignup
                onSignup={handleSignup}
                onSwitchToLogin={() => router.push("/auth/user/login")}
                onBack={() => router.push("/")}
            />
        </div>
    )
}
